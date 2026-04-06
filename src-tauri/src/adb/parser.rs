use crate::device::types::{Device, DeviceState};
use crate::transfer::types::FileEntry;

/// Parse `adb devices -l` output into a list of devices
pub fn parse_device_list(output: &str) -> Vec<Device> {
    output
        .lines()
        .skip(1) // Skip "List of devices attached" header
        .filter(|line| !line.trim().is_empty())
        .filter_map(parse_device_line)
        .collect()
}

fn parse_device_line(line: &str) -> Option<Device> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 2 {
        return None;
    }

    let id = parts[0].to_string();
    let state = match parts[1] {
        "device" => DeviceState::Connected,
        "unauthorized" => DeviceState::Unauthorized,
        _ => DeviceState::Offline,
    };

    // Parse key:value pairs like model:Pixel_7 product:panther
    let mut model = String::new();
    let mut product = String::new();
    for part in &parts[2..] {
        if let Some(val) = part.strip_prefix("model:") {
            model = val.replace('_', " ");
        } else if let Some(val) = part.strip_prefix("product:") {
            product = val.to_string();
        }
    }

    Some(Device {
        id,
        model,
        product,
        state,
    })
}

/// Parse `adb shell ls -la <path>` output into file entries
pub fn parse_file_list(output: &str) -> Vec<FileEntry> {
    output
        .lines()
        .filter(|line| !line.trim().is_empty())
        .filter(|line| !line.starts_with("total "))
        .filter_map(parse_ls_line)
        .filter(|entry| entry.name != "." && entry.name != "..")
        .collect()
}

fn parse_ls_line(line: &str) -> Option<FileEntry> {
    // Format: drwxrwx--x 5 root everybody 3488 2024-01-15 10:30 Download
    // Or:     -rw-rw---- 1 root everybody 12345 2024-01-15 10:30 photo.jpg
    let parts: Vec<&str> = line.split_whitespace().collect();

    // Need at least: permissions, links, owner, group, size, date, time, name
    if parts.len() < 8 {
        return None;
    }

    let permissions = parts[0].to_string();
    if permissions.len() < 2 {
        return None;
    }

    let is_dir = permissions.starts_with('d');
    let size = parts[4].parse::<u64>().unwrap_or(0);
    let date = parts[5];
    let time = parts[6];
    let modified = format!("{date} {time}");

    // Name is everything from parts[7] onward (may contain spaces)
    let name_part = parts[7..].join(" ");

    // Handle symlinks: "name -> target"
    let name = if let Some(idx) = name_part.find(" -> ") {
        name_part[..idx].to_string()
    } else {
        name_part
    };

    Some(FileEntry {
        name,
        is_dir,
        size,
        modified,
        permissions,
    })
}

/// Parse adb push/pull progress line
/// Format: "[ 45%] /path/to/file 1234/5678"
pub fn parse_transfer_progress(line: &str) -> Option<(f32, u64, u64)> {
    let line = line.trim();

    // Match pattern: [ XX%]
    if !line.starts_with('[') {
        return None;
    }
    let bracket_end = line.find(']')?;
    let pct_str = line[1..bracket_end].trim().strip_suffix('%')?;
    let percentage = pct_str.parse::<f32>().ok()?;

    // Try to parse bytes: "1234/5678" at the end
    let rest = line[bracket_end + 1..].trim();
    let last_part = rest.rsplit_once(' ').map(|(_, last)| last).unwrap_or(rest);

    if let Some((transferred, total)) = last_part.split_once('/') {
        let bytes_transferred = transferred.parse::<u64>().unwrap_or(0);
        let total_bytes = total.parse::<u64>().unwrap_or(0);
        Some((percentage, bytes_transferred, total_bytes))
    } else {
        Some((percentage, 0, 0))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_device_list_single_device() {
        let output = "\
List of devices attached
R5CR20FGMHJ           device usb:1-1 product:panther model:Pixel_7 device:panther transport_id:1
";
        let devices = parse_device_list(output);
        assert_eq!(devices.len(), 1);
        assert_eq!(devices[0].id, "R5CR20FGMHJ");
        assert_eq!(devices[0].model, "Pixel 7");
        assert_eq!(devices[0].product, "panther");
        assert_eq!(devices[0].state, DeviceState::Connected);
    }

    #[test]
    fn test_parse_device_list_multiple_devices() {
        let output = "\
List of devices attached
R5CR20FGMHJ           device usb:1-1 product:panther model:Pixel_7 device:panther transport_id:1
ABCD1234              unauthorized usb:1-2 transport_id:2
";
        let devices = parse_device_list(output);
        assert_eq!(devices.len(), 2);
        assert_eq!(devices[0].state, DeviceState::Connected);
        assert_eq!(devices[1].state, DeviceState::Unauthorized);
        assert_eq!(devices[1].id, "ABCD1234");
    }

    #[test]
    fn test_parse_device_list_empty() {
        let output = "List of devices attached\n\n";
        let devices = parse_device_list(output);
        assert_eq!(devices.len(), 0);
    }

    #[test]
    fn test_parse_file_list() {
        let output = "\
total 128
drwxrwx--x 5 root everybody      3488 2024-01-15 10:30 Download
-rw-rw---- 1 root everybody   1234567 2024-03-20 14:22 photo.jpg
lrwxrwxrwx 1 root root             12 2024-01-01 00:00 link -> /data/target
";
        let entries = parse_file_list(output);
        assert_eq!(entries.len(), 3);

        assert_eq!(entries[0].name, "Download");
        assert!(entries[0].is_dir);
        assert_eq!(entries[0].size, 3488);
        assert_eq!(entries[0].modified, "2024-01-15 10:30");

        assert_eq!(entries[1].name, "photo.jpg");
        assert!(!entries[1].is_dir);
        assert_eq!(entries[1].size, 1234567);

        // Symlink — name without " -> target"
        assert_eq!(entries[2].name, "link");
    }

    #[test]
    fn test_parse_file_list_filters_dot_entries() {
        let output = "\
total 64
drwxrwx--x 2 root root 4096 2024-01-01 00:00 .
drwxrwx--x 3 root root 4096 2024-01-01 00:00 ..
-rw-rw---- 1 root root  100 2024-01-01 00:00 file.txt
";
        let entries = parse_file_list(output);
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "file.txt");
    }

    #[test]
    fn test_parse_transfer_progress() {
        let result = parse_transfer_progress("[ 45%] /sdcard/photo.jpg 1234/5678");
        assert!(result.is_some());
        let (pct, transferred, total) = result.unwrap();
        assert!((pct - 45.0).abs() < 0.1);
        assert_eq!(transferred, 1234);
        assert_eq!(total, 5678);
    }

    #[test]
    fn test_parse_transfer_progress_100() {
        let result = parse_transfer_progress("[100%] /sdcard/photo.jpg 5678/5678");
        assert!(result.is_some());
        let (pct, _, _) = result.unwrap();
        assert!((pct - 100.0).abs() < 0.1);
    }

    #[test]
    fn test_parse_transfer_progress_not_progress_line() {
        assert!(parse_transfer_progress("some random output").is_none());
        assert!(parse_transfer_progress("").is_none());
    }
}

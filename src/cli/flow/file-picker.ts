import { spawnSync } from "node:child_process";

export function pickFilePath(dialogTitle: string): string | undefined {
  if (process.platform === "darwin") {
    return pickFilePathMac(dialogTitle);
  }
  if (process.platform === "win32") {
    return pickFilePathWindows(dialogTitle);
  }
  return pickFilePathLinux(dialogTitle);
}

function pickFilePathMac(dialogTitle: string): string | undefined {
  const script = `POSIX path of (choose file with prompt "${escapeAppleScriptString(dialogTitle)}")`;
  const result = spawnSync("osascript", ["-e", script], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) {
    return undefined;
  }
  const value = result.stdout.trim();
  return value.length > 0 ? value : undefined;
}

function pickFilePathWindows(dialogTitle: string): string | undefined {
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
    `$dialog.Title = "${escapePowerShellString(dialogTitle)}"`,
    "$dialog.Multiselect = $false",
    "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
    "  [Console]::Out.Write($dialog.FileName)",
    "}",
  ].join("; ");
  const result = spawnSync("powershell", ["-NoProfile", "-Command", script], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) {
    return undefined;
  }
  const value = result.stdout.trim();
  return value.length > 0 ? value : undefined;
}

function pickFilePathLinux(dialogTitle: string): string | undefined {
  const zenity = spawnSync("zenity", ["--file-selection", "--title", dialogTitle], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (zenity.status === 0) {
    const value = zenity.stdout.trim();
    return value.length > 0 ? value : undefined;
  }

  const kdialog = spawnSync("kdialog", ["--getopenfilename", ".", "", "--title", dialogTitle], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (kdialog.status === 0) {
    const value = kdialog.stdout.trim();
    return value.length > 0 ? value : undefined;
  }
  return undefined;
}

function escapeAppleScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapePowerShellString(value: string): string {
  return value.replace(/"/g, '`"');
}

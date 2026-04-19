import { spawnSync } from "node:child_process";

export function pickFilePaths(dialogTitle: string): string[] {
  if (process.platform === "darwin") {
    return pickFilePathsMac(dialogTitle);
  }
  if (process.platform === "win32") {
    return pickFilePathsWindows(dialogTitle);
  }
  return pickFilePathsLinux(dialogTitle);
}

export function pickFilePath(dialogTitle: string): string | undefined {
  if (process.platform === "darwin") {
    return pickFilePathMac(dialogTitle);
  }
  if (process.platform === "win32") {
    return pickFilePathWindows(dialogTitle);
  }
  return pickFilePathLinux(dialogTitle);
}

function pickFilePathsMac(dialogTitle: string): string[] {
  const prompt = escapeAppleScriptString(dialogTitle);
  const script = [
    `set dialogPrompt to "${prompt}"`,
    "try",
    "  set chosenFiles to choose file with prompt dialogPrompt with multiple selections allowed",
    "on error number -128",
    "  return \"\"",
    "end try",
    "set pathLines to \"\"",
    "set n to count of chosenFiles",
    "repeat with i from 1 to n",
    "  set f to item i of chosenFiles",
    "  set pathLines to pathLines & POSIX path of f & linefeed",
    "end repeat",
    "return pathLines",
  ].join("\n");
  const result = spawnSync("osascript", ["-e", script], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) {
    return [];
  }
  return splitPickedPaths(result.stdout);
}

function pickFilePathsWindows(dialogTitle: string): string[] {
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$dialog = New-Object System.Windows.Forms.OpenFileDialog",
    `$dialog.Title = "${escapePowerShellString(dialogTitle)}"`,
    "$dialog.Multiselect = $true",
    "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {",
    "  foreach ($name in $dialog.FileNames) { [Console]::Out.WriteLine($name) }",
    "}",
  ].join("; ");
  const result = spawnSync("powershell", ["-NoProfile", "-Command", script], {
    encoding: "utf-8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) {
    return [];
  }
  return splitPickedPaths(result.stdout);
}

function pickFilePathsLinux(dialogTitle: string): string[] {
  const zenity = spawnSync(
    "zenity",
    ["--file-selection", "--multiple", "--title", dialogTitle, "--separator", "\n"],
    {
      encoding: "utf-8",
      stdio: "pipe",
      shell: false,
      windowsHide: true,
    },
  );
  if (zenity.status === 0) {
    return splitPickedPaths(zenity.stdout);
  }
  return [];
}

export function splitPickedPaths(raw: string): string[] {
  const normalized = raw
    .replace(/\r\n/g, "\n")
    .split(/[\n|]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return normalized;
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

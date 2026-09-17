# Controlled Windows Distribution Checklist

1. Build signed source from a clean commit and verify tests, secret scan and version.
2. Install the NSIS or MSI bundle on a clean supported Windows profile.
3. Confirm WebView2 is available or provisioned through the supported Microsoft runtime path.
4. Start ORPHEUS, verify the activation gate, activate an authorized test license and restart.
5. Confirm `orpheus-license.json` restores the signed license from the user application-data directory.
6. Confirm narrative, search and investigation data remain separate.
7. Test offline restart inside the configured grace period.
8. Test recovery and activation-limit behavior against the authorized activation service when it is deployed.
9. Configure and verify the HTTPS narrative endpoint; complete all 12 boxes with an authorized MASTER license.
10. Interrupt the app during an active box, restart Windows and confirm attempts, hints, unlocks and completion restore.
11. Uninstall and reinstall, explicitly recording whether the user chose to preserve application data.
12. Verify Windows 10 x64 and Windows 11 x64 separately before declaring production readiness.

End users do not need Node.js, npm, Rust, Cargo, Tauri CLI or Visual Studio Build Tools. Those are development-only requirements.

Unsigned executables may trigger Microsoft SmartScreen reputation warnings. ORPHEUS does not bypass or suppress Windows security controls. Production distribution should use a reputable code-signing certificate; future signing must occur after reproducible build verification and before installer publication.

Installers belong in a controlled delivery channel or GitHub Releases, not normal Git history.

The recommended 1.0 model is public source with controlled buyer-only binaries. Do not attach commercial installers to a public GitHub Release without an explicit owner decision. AppData is intentionally preserved by the default installer/uninstaller behavior unless the user removes it; this supports license and campaign recovery after reinstall.

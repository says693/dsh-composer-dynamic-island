# Security Policy

## Supported versions

Security fixes are provided for the latest release on the `main` branch.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting feature for this repository.
Do not disclose a suspected vulnerability in a public issue before a fix or
coordinated disclosure is available.

Include affected versions, reproduction steps, impact, and any suggested
mitigation. Reports that involve DSH or dsh-TUI itself should also follow the
upstream project's private security-reporting process.

## Security boundary

This plugin runs in the same process and browser context as its DSH host. It is
not a sandbox. Its Community v0.15 manifest requests no permissions, and its
optional Web adapter performs no network or filesystem access. See
[`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) for the exact boundary.

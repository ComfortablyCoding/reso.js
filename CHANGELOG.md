# Changelog

All notable changes will be documented in this file.

## [0.2.0]

### Added

- Support passing a generic interface to `createFeed`/`Feed`, enabling full type inference and safety for all resource operations

### Changed

- Updated various dependencies to latest stable versions.
- Updated the response structure to a unified data property. For single entities, data contains the entity object (R). For collections, data contains an array of entities (R[]).

### Fixed

- Pinned vulnerable dependencies for improved security and stability.
- Return types for `readById` and `readByQuery`.

---

## [0.1.0]

### Added

- Initial project release.
- Core functionality implemented.
- Basic documentation and setup instructions.

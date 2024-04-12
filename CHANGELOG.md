### 2024-04-12 / 5.0.5

- chore: Updated dependencies.
- chore: Added missing dependency.

### 2024-02-07 / 5.0.4

- chore: Updated dependencies.
- chore: Replaced tap with Node test runner.

### 2024-01-27 / 5.0.3

- chore: Fixed build.

### 2024-01-27 / 5.0.2

- chore: Updated dependencies.

### 2024-01-24 / 5.0.1

- chore: Updated TypeScript configuration.

### 2023-12-20 / 5.0.0

- chore: Updated dependencies.
- chore: Changed TypeScript version.

### 2023-10-23 / 4.1.0

- chore: Updated dependencies and toolchain.
- chore: Fixed compilation.
- chore: CI improvement

### 2022-11-23 / 4.0.12

- chore: Updated dependencies.
- chore: Update package.json
- fix: Fixed build script.

### 2022-10-12 / 4.0.11

- fix: Updated types layout.
- chore: Updated compilation configuration.

### 2022-08-30 / 4.0.10

- chore: Updated dependencies.
- chore: Remove variadic method.

### 2022-08-29 / 4.0.9

- chore: Updated dependencies.
- fix: Fixed CI.

### 2022-05-02 / 4.0.8

- fix: Correctly Export models.

### 2022-05-02 / 4.0.7

- fix: Export models.

### 2022-05-02 / 4.0.6

- fix: Export models.
- chore: Use sourcemaps with swc

### 2022-03-07 / 4.0.5

- chore: Updated dependencies.

### 2022-03-07 / 4.0.4

- chore: Updated dependencies.

### 2022-01-26 / 4.0.3

- chore: Updated dependencies and linted code.
- chore: Updated dependencies.
- chore: Removed useless file.

### 2021-11-17 / 4.0.2


### 2021-11-16 / 4.0.1

- fix: Added ESM note in the README.md
- chore: Allow manual CI triggering.
- chore: Updated badges.
- fix: Fixed Typescript configuration.

### 2021-08-24 / 4.0.0

- feat: Only export as ESM.
- fix: Removed useless comment.
- chore: Fine tuned build script.

### 2021-01-04 / 3.2.0

- feat: Use different versioning for User-Agent.

### 2021-01-04 / 3.1.0

- feat: Export as ESM.

### 2021-01-03 / 3.0.2

- chore: Fixed license link in README.md.

### 2021-01-03 / 3.0.1

- chore: Updated linter config.
- chore: Removed IDE files.

### 2021-01-03 / 3.0.0

- **Simplified to only `info` and `stream` methods.**
- **Dropped supported for Node < 12**.
- Completely rewritten in TypeScript.

### 2016-10-29 / 2.0.1

- Updated request package version to fix a vulnerability. Thanks to @gazay.

### 2016-03-23 / 2.0.0

- **Dropped support for Node < 5.**
- `fastimage.info` always includes `realPath` and `realUrl` instead of omitting them if equals to `path` and `url`.

### 2016-03-08 / 1.2.0

- `fastimage.threshold` can now accept value less than or equal to zero to disable the feature and try to download/open the entire file/stream. This fixes detection of corrupted files.

### 2016-03-07 / 1.1.1

- Bumped version in package.json.

### 2016-03-07 / 1.1.0

- Added `fastimage.userAgent` to enable User Agent handling. Thanks to matcarey.

### 2015-05-25 / 1.0.2

- Ensured promise is included as dependency.

### 2015-05-06 / 1.0.1

- Ensured Node 0.10 compatibility.

### 2015-03-28 / 1.0.0

- Renamed `fastimage.analyze` as `fastimage.info`.
- Added `fastimage.filteredInfo` to filter the result object.
- Make `fastimage.info`, `fastimage.filteredInfo`, `fastimage.size` and `fastimage.type` return a Promise.
- Added `fastimage.stream` and exported `FastImageStream` for streaming support.
- Support for analyzing Buffers.
- Added examples and test.

### 2015-03-14 / 0.2.0 - The PI release!

- Added support for analyzing local files.
- Added `realPath`, `realUrl` and `size` to the returned objects.
- Added documentation.
- Improved README.

### 2015-03-10 / 0.1.1

- Export `FastImageError` as well.

### 2015-03-10 / 0.1.0

- Initial version

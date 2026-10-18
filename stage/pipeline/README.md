# Avatar pipeline

How the people in `assets/avatars` were made, for adding more later.

1. Download an avatar from github.com/microsoft/Microsoft-Rocketbox (`Assets/Avatars/.../Export/<name>.fbx` and its `Textures/*.tga`).
2. Convert: `FBX2glTF -i <name>.fbx -o out/<name> --anim-framerate bake30` (binary from the `fbx2gltf` npm package).
3. Textures: `python prep_textures.py <folder with tga files> build/<name>/tex`
4. Pack: `node pack.mjs out/<name>_out/<name>.gltf build/<name>/tex assets/avatars/<id>.glb` (needs `@gltf-transform/core`, `extensions`, `functions`).
5. Motion clips: convert each `*.max.fbx` animation the same way into one folder, then `python extract_anims.py <folder> assets/stage/clips.bin`.

Thumbnails and portraits are rendered from the stage itself: run `node saver.mjs <project root> 8766`, open `http://localhost:8766/stage/dev/stage.html`, and use `window.__debug.capture(t)` with a POST to `/save?path=assets/thumbs/<id>.jpg`. `node stage/export-scenes.mjs` writes the scene list the page needs.

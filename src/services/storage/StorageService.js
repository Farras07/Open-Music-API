const fs = require('fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, id, meta, oldFile) {
    const filename = `${id}${meta.filename}`;
    const path = `${this._folder}/${filename}`;

    return new Promise((resolve, reject) => {
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }

      const fileStream = fs.createWriteStream(path);

      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve({ filename, path }));
    });
  }
}

module.exports = StorageService;

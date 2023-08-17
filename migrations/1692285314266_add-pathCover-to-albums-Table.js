exports.up = (pgm) => {
  pgm.addColumn('albums', {
    pathCover: {
      type: 'TEXT',
      unique: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'pathCover');
};

const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: (request, h) => handler.postCollaborationsHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: (request, h) => handler.deleteCollaborationsHandler(request, h),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;

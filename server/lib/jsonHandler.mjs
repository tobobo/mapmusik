export default handler => (req, res, next) => {
  handler(req)
    // eslint-disable-next-line promise/always-return
    .then(({ status, body }) => {
      res.status(status).json(body);
    })
    // eslint-disable-next-line promise/no-callback-in-promise
    .catch(next);
};


module.exports = {
    sqlHelper: function (sql, args, req) {
        return new Promise( (resolve, reject) => {
          req.pool.getConnection(function (err, connection){
            if(err){
              // Error, reject promise
              return reject(err);
            }
            connection.query(sql, args, (err, rows) => {
              connection.release();
              if(err) {
                // Reject the promise, returning the error
                return reject(err);
              }
              // No error, return the result
              resolve(rows);
            });
          });
        });
      },
    sendError: function (res, err){
        // Send error
        if(err === undefined){
          res.sendStatus(500);
          return;
        }
        if(err.message !== undefined){
          res.status(500).send(err.message);
        } else {
          res.status(500).json(err);
        }
        return;
      }
};
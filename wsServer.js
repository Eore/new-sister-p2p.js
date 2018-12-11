let ws = require("ws");
let port = 4444;

let listConnection = {};

let wsServer = new ws.Server({ port });
wsServer.on("connection", (socket, request) => {
  let id = request.url.substr(1);
  listConnection[id] = socket;
  console.log(`${new Date().toLocaleString("ID")} : ${id} connected`);

  wsServer.clients.forEach(client => {
    sendMessage(client, {
      to: "all",
      from: "server",
      type: "request-list",
      message: Object.keys(listConnection)
    });
  });

  socket.on("message", data => {
    let at = Date.now();
    let { to, from, type, message } = JSON.parse(data);
    console.log("Incoming :\n", { to, from, type, message, at });
    if (listConnection[to] !== undefined) {
      console.log("Sending : \n", { to, from, type, message, at });
      listConnection[to].send(JSON.stringify({ to, from, type, message, at }));
    } else if (to === "server") {
      switch (type) {
        case "request-list":
          sendMessage(socket, {
            to: from,
            from: "server",
            type: "request-list",
            message: Object.keys(listConnection)
          });
          break;
      }
    } else {
      console.log(`ID ${to} not in list`);
    }
  });
  socket.onclose = ({ reason }) => {
    let { id } = JSON.parse(reason);
    delete listConnection[id];
    console.log(`${new Date().toLocaleString("ID")} : ${id} disconnected`);
    wsServer.clients.forEach(client => {
      sendMessage(client, {
        to: "all",
        from: "server",
        type: "request-list",
        message: Object.keys(listConnection)
      });
    });
  };
});

let sendMessage = (connection, { to, from, type, message }) => {
  let at = Date.now();
  connection.send(
    JSON.stringify({
      to,
      from,
      type,
      message,
      at
    })
  );
};

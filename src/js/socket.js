export const socket = (() => {
  let ret = {};
  ret.ws = null;
  ret.localId = null;

  ret.connect = (host, localId) =>
    new Promise(resolve => {
      ret.ws = new WebSocket(`ws://${host}/${localId}`);
      ret.localId = localId;
      window.onbeforeunload = () => {
        ret.ws.close(1000, JSON.stringify({ id: localId }));
      };
      // ret.ws.onmessage = ({ data }) => {
      //   console.log(data);
      // };
      ret.ws.onopen = () => {
        resolve();
      };
    });

  ret.sendMessage = (to, type, message) => {
    ret.ws.send(JSON.stringify({ to, type, from: ret.localId, message }));
  };

  ret.requestList = () => {
    ret.ws.send(
      JSON.stringify({ to: "server", from: ret.localId, type: "request-list" })
    );
  };

  return ret;
})();

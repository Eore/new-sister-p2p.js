let Peer = require("simple-peer");

export const peer = (() => {
  let ret = {};

  ret.listPeer = {};

  ret.newPeer = (id, init = false) =>
    new Promise(resolve => {
      let peer = new Peer({
        initiator: init,
        trickle: false
      });

      peer.on("signal", data => {
        resolve(data);
      });

      ret.listPeer[id] = peer;
    });

  ret.connectToPeer = (peerId, sdp) =>
    new Promise(resolve => {
      ret.listPeer[peerId].signal(sdp);

      ret.listPeer[peerId].on("signal", answer => {
        resolve(answer);
      });
    });

  ret.sendMessage = (peerId, message) => {
    ret.listPeer[peerId].send(message);
  };

  return ret;
})();

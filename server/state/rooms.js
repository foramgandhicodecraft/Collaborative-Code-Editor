import * as Y from "yjs";

const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { users: new Map(), docs: new Map(), chat: [] });
  }
  return rooms.get(roomId);
}

function getLangDoc(room, lang) {
  if (!room.docs.has(lang)) room.docs.set(lang, new Y.Doc());
  return room.docs.get(lang);
}

function roomUsers(roomId) {
  return Array.from(getRoom(roomId).users.values());
}

function deleteRoom(roomId) {
  rooms.delete(roomId);
}

function hasRoom(roomId) {
  return rooms.has(roomId);
}

export { rooms, getRoom, getLangDoc, roomUsers, deleteRoom, hasRoom };

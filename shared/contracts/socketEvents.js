const LOBBY_EVENTS = {
  CREATE_ROOM: 'create_room',
  ROOM_CREATED: 'room_created',
  JOIN_ROOM: 'join_room',
  PLAYER_JOINED: 'player_joined',
  LEAVE_ROOM: 'leave_room',
  PLAYER_LEFT: 'player_left',
  ROOM_LIST: 'room_list',
  PLAYER_READY: 'player_ready',
  GAME_STARTING: 'game_starting'
};

const ROOM_EVENTS = {
  ROOM_UPDATED: 'room_updated'
};

const GAME_EVENTS = {
  GAME_STARTED: 'game_started',
  DRAW_TILE: 'draw_tile',
  DISCARD_TILE: 'discard_tile',
  SORT_TILES: 'sort_tiles',
  DECLARE_WIN: 'declare_win',
  NEW_HAND: 'new_hand'
};

const GAME_RESPONSES = {
  GAME_STARTED: 'game_started',
  DRAW_TILE: 'draw_tile',
  OPPONENT_DREW: 'opponent_drew',
  DISCARD_TILE: 'discard_tile',
  TURN_CHANGED: 'turn_changed',
  HAND_RESULT: 'hand_result',
  MATCH_RESULT: 'match_result',
  WIN_ERROR: 'win_error',
  NEW_HAND: 'new_hand'
};

const CHAT_EVENTS = {
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message'
};

module.exports = {
  LOBBY_EVENTS,
  ROOM_EVENTS,
  GAME_EVENTS,
  GAME_RESPONSES,
  CHAT_EVENTS
};

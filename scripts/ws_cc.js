'use strict';

const ANCHOR_ID = "cc_div";

console.log("initializing ws_connection_counter widget...");

const get_anchor = () => document.getElementById(ANCHOR_ID);
const remove_all_children = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

function set_loading() {
  remove_all_children(get_anchor());
  const loader = document.createElement('div');
  get_anchor().appendChild(loader);
  const loader_heading = document.createElement('h1');
  loader.appendChild(loader_heading);
  loader_heading.textContent = "Waking up the Heroku Dyno... (imagine your ad here?)";
  loader_heading.animate(
    [{ opacity: 0.05 }, { opacity: 1 }, { opacity: 0.05 }],
    { duration: 2000, iterations: Infinity, easing: 'ease-in-out' }
  );
};

function set_data_changed(data) {
  remove_all_children(get_anchor());
  const data_root = document.createElement('div');
  get_anchor().appendChild(data_root);
  const header = document.createElement('h1');
  data_root.appendChild(header);
  header.textContent = "# of currently connected users: " + Object.values(data).reduce((pv, cv) => pv + cv, 0);
  const list_header = document.createElement('p');
  list_header.textContent = "Connected users by 'user-agent':"
  data_root.appendChild(list_header);
  // render top n elements in list
  const list = document.createElement('ul');
  data_root.appendChild(list);
  for (const [key, value] of Object.entries(data)
    .sort((a, b) => b[1] - a[1]) // order by value desc
    .slice(0, 10)) { // max top n elements

    // process entry
    const list_entry = document.createElement('li');
    list.appendChild(list_entry);
    list_entry.innerText = `${key}: ${value}`;
  }
}

function connect() {
  const websocket = new WebSocket(BACKEND_URL);
  websocket.onopen = ev => {
    console.log(`connection counter backend connected, backend-url: ${BACKEND_URL}`);
    websocket.send(navigator.userAgent);
  };
  websocket.onmessage = ev => {
    const data = JSON.parse(ev.data).data;
    set_data_changed(data);
  }
  websocket.onerror = ev => set_loading();
  websocket.onclose = websocket.onerror;
}

set_loading();

// connect:
const BACKEND_URL = "wss://f-page-be-cc.herokuapp.com/connection-counter";
connect();

// offline test:
// const BACKEND_URL = "ws://localhost:8080/connection-counter";
// setTimeout(connect, 3000);
// for offline testing:
// setTimeout(() => set_data_changed({
//   "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0": 3,
//   "other ua7": 5,
//   "other ua1": 5,
//   "other ua2": 5,
//   "other ua3": 5,
//   "other ua4": 5,
//   "other ua5": 5,
//   "other ua6": 5,
// }), 1000);

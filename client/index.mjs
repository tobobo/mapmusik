import { createElement } from 'react';
import { render } from 'react-dom';
import Modal from 'react-modal';
import App from './app/App.mjs';

Modal.setAppElement('body');

render(createElement(App), document.getElementById('app'));

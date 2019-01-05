import { createElement } from 'react';
import { render } from 'react-dom';
import App from './app/app.mjs';

render(createElement(App), document.getElementById('app'));

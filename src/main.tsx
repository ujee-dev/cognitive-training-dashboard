//import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  /** StrictMode **/
  // React Strict Mode에서는 컴포넌트가 두 번 렌더링되는 현상이 발생할 수 있습니다.
  // 이는 React의 개발 모드에서 부작용을 감지하고자 의도적으로 렌더링을 두 번 수행하는 것입니다.
  // 이는 프로덕션 환경에서는 발생하지 않으며, 오직 개발 환경에서만 나타납니다.
  /*<React.StrictMode>*/
    <App />
  /*</React.StrictMode>*/
);
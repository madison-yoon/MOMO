import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp'
import Home from './pages/Home';
import Layout from './pages/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 2. 로그인 성공 후 이동할 진짜 홈 화면 및 기타 페이지들 (헤더/푸터 적용) */}
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} /> {/* 기존 홈은 /home으로 이동 */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

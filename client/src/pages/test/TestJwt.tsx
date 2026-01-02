import { useState, useRef, useEffect } from "react";
import { signup, login, saveRecord, getTopRecords, getMyRecords } from "../../api/api";
import type { Record } from "../../types/record";
import type { Difficulty } from '../../config/gameConfig';
import axios from "axios";

// 지금의 코드는 휘발성(useState)으로 새로고침하면 토큰 사라짐
// 토큰 만료 시 갑자기 401 - 기록 저장 실패 메시지 전송 = 부자연스러움
// 추가 필요 학습
// - 로그인 성공: 토큰을 localStorage에 저장
// -> 앱 시작 시: useEffect에서 localStorage에 토큰이 있는지 확인하고 있으면 setToken에 넣어줌.
// -> API 호출: 헤더에 localStorage에서 꺼낸 토큰을 공통으로 넣어줌

export function TestJwt() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string>("");
  const [message, setMessage] = useState<string>("대기 중...");

  const [record, setRecord] = useState<Record>({
    userName: "",
    difficulty: "easy",
    clearTime: 0,
    flipCount: 0,
    createdAt: "", // 실제로는 string으로 들어 옴
  });

  const [rankings, setRankings] = useState<Record[]>([]);
  const [myRecords, setMyRecords] = useState<Record[]>([]);

  const [difficultyR, setDifficultyRank] = useState<Difficulty>('normal');
  const [difficultyMy, setDifficultyMy] = useState<Difficulty>('normal');

  const messageEndRef = useRef<HTMLDivElement | null>(null);
  // 메시지 누적 함수 (진행 과정을 다 보기 위함)
  const addLog = (msg: string) => {
    setMessage((prev) => `${prev}\n[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  // 1. 회원가입 -> 성공 시 자동으로 로그인 호출
  const handleSignup = async () => {
    addLog(`회원가입 시도: ${email}`);
    try {
      // 1. 가입 시도 (에러 발생 시 여기서 멈추고 catch로 점프함)
      await signup({ email, password });

      // 2. 가입이 정말 성공했을 때만 아래 로그가 찍혀야 함
      addLog("✅ 회원가입 성공! 이어서 로그인을 시도합니다...");
      
      // 가입 성공 후 바로 로그인 시도
      await handleLogin(); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        addLog(`❌ 회원가입 실패: ${msg}`);

        if (msg.includes("존재")) {
          setEmail(""); // 이메일만 초기화
          setPassword("");
        }
        
        // 사용자에게 알림을 띄우고 싶다면
        alert(msg);
      } else {
        addLog(`회원가입 실패: ${(err as Error).message}`);
      }
    }
  };

  // 2. 로그인
  const handleLogin = async () => {
    addLog(`로그인 시도: ${email}`);
    try {
      const data = await login({ email, password });

      if (data.accessToken) {

        // 1. 먼저 로컬스토리지에 저장
        localStorage.setItem('accessToken', data.accessToken);
        
        // 2. 상태 업데이트 (화면 표시용)
        setToken(data.accessToken);
        console.log("저장 직후 로컬스토리지 확인:", localStorage.getItem('accessToken'));

        addLog("✅ 로그인 성공! JWT 토큰 획득 완료");

        // 로그인 성공 시 입력창 클리어 및 레코드 이름 자동 입력
        setRecord((prev) => ({ ...prev, userName: email })); // 기록 섹션에 이메일 자동 삽입
        setEmail("");
        setPassword("");
      } else {
        addLog("❓ 로그인 응답에 토큰이 없습니다.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        addLog(`❌ 로그인 실패: ${msg}`);

        // 사용자에게 알림을 띄우고 싶다면
        alert(msg);
      } else {
        addLog(`로그인 실패: ${(err as Error).message}`);
      }
    }
  };

  // 로그아웃 로직 (버튼에서 호출하거나 함수로 분리)
  const handleLogout = () => {
    // 1. 로컬스토리지에서 토큰 삭제 (저장할 때 사용한 키 이름과 일치해야 함)
    localStorage.removeItem('accessToken');

    // 2. (선택 사항) 만약 다른 정보도 저장했다면 전체 삭제
    // localStorage.clear(); 

    // 3. (선택 사항) 페이지 새로고침 또는 로그인 페이지로 이동
    // window.location.href = '/login';
    
    setToken("");
    setEmail("");
    setPassword("");
    setMyRecords([]);
    setRecord({ userName: "", difficulty: "easy", clearTime: 0, flipCount: 0, createdAt: "" }); // 전체 초기화
    addLog("🔒 로그아웃: 모든 세션 및 입력창이 초기화되었습니다.");
  };

  // 3. 기록 저장 (토큰 필요)
  const handleSaveRecord = async () => {
    if (!token) {
      addLog("⚠️ 오류: 로그인이 필요합니다 (토큰 없음)");
      return;
    }

    try {
      await saveRecord(record);
      addLog("✅ 기록 저장 완료!");

      handleGetRankings();
      handleGetMyRecords();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        addLog(`❌ 기록 저장 실패: ${msg}`);
      } else {
        addLog(`기록 저장 실패: ${(err as Error).message}`);
      }
    }
  };

  // 랭킹 조회
  const handleGetRankings = async (diff?: Difficulty) => {
    const targetDiff = diff || difficultyR; // 인자가 있으면 그것을, 없으면 현재 state 사용
    addLog(`📡 [${targetDiff}] 랭킹 조회 요청 중...`);
    
    try {
      const data = await getTopRecords(targetDiff);
      console.log("🏆 서버에서 받은 데이터:", data); // 브라우저 콘솔(F12) 확인용

      // 데이터가 배열인지 확인 후 저장
      // 객체에 담아서 보내고 있다면, 프론트엔드에서도 조건 맞춰서
      const actualList = Array.isArray(data) ? data : data.data;

      if (Array.isArray(actualList)) {
        setRankings(actualList);
        addLog(`✅ 랭킹 [${targetDiff}] 조회 ${actualList.length}개`);
      } else {
        addLog("❓ 랭킹 - 서버 응답이 배열 형식이 아닙니다.");
        console.log("랭킹 - 받은 데이터 형식:", data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        addLog(`❌ 랭킹 조회 실패: ${msg}`);
      } else {
        addLog(`랭킹 조회 실패: ${(err as Error).message}`);
      }
    }
  };

  // 내 기록 조회
  const handleGetMyRecords = async (diff?: Difficulty) => {
    if (!token) return addLog("로그인이 필요합니다.");
    const targetDiff = diff || difficultyMy;

    try {
      const data = await getMyRecords(targetDiff);

      const actualList = Array.isArray(data) ? data : data.data;

      if (Array.isArray(actualList)) {
        setMyRecords(actualList);
        addLog(`✅ 내 기록 [${targetDiff}] 조회 ${actualList.length}개`);
      } else {
        addLog("❓ 내 기록 - 서버 응답이 배열 형식이 아닙니다.");
        console.log("내 기록 - 받은 데이터 형식:", data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        const msg = Array.isArray(serverMessage) ? serverMessage.join(' / ') : serverMessage || err.message;
        addLog(`❌ 내 기록 조회 실패: ${msg}`);
      } else {
        addLog(`내 기록 조회 실패: ${(err as Error).message}`);
      }
    }
  };

  useEffect(() => {
    // 1. 외부 시스템(API)으로부터 데이터를 가져오는 비동기 함수 호출
    const fetchInitialData = async () => {
      try {
        // 위에서 만든 함수를 호출하여 상태를 업데이트 (setState 호출)
        await handleGetRankings(); 
        
        // 토큰이 있다면 내 기록도 동기화
        if (token) {
          await handleGetMyRecords();
        } else {
          addLog(`개인 기록 조회: 로그인이 필요합니다.`);
        }
      } catch (err: unknown) {
        addLog(`초기 데이터 로드 실패: ${(err as Error).message}`);
      }
    };

    fetchInitialData();
    
    // 의존성 배열을 비워두어( [] ) 마운트 시점에만 실행되도록 제한 (무한 루프 방지)
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto", fontFamily: "Pretendard-Medium", fontSize: "12px" }}>
      <h1>JWT 인증 통합 테스트</h1>
      
      {/* 로그 메시지 창 */}
      <div style={{ 
        backgroundColor: "#1e1e1e", color: "#00ff00", padding: "1rem",
        height: "200px", overflowY: "auto", marginBottom: "30px", marginTop: "20px",
        borderRadius: "8px", whiteSpace: "pre-wrap", fontSize: "13px"
      }}>
        {message}
        <div ref={messageEndRef} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: "2rem", gap: "20px" }}>
        {/* 왼쪽: 계정 및 로그인 */}
        <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", gap: "20px" }}>
          <h2>1. 계정 관리</h2>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <p className="text-red-400">- 비밀번호: 영문과 숫자를 포함, 8자 이상</p>
          <div style={{ marginTop: "10px", gap: "20px" }}>
            <button onClick={handleSignup} style={btnStyle}>회원가입 & 자동로그인</button>
            <button onClick={handleLogin} style={{ ...btnStyle, backgroundColor: "#4CAF50" }}>로그인만 실행</button>
          </div>
          <p style={{ marginTop: "10px", wordBreak: "break-all", fontSize: "12px", color: token ? "blue" : "red" }}>
            <strong>현재 토큰:</strong> {token ? `${token.substring(0, 30)}...` : "없음"}
          </p>
        </section>

        {/* 오른쪽: 데이터 전송 */}
        <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", gap: "20px" }}>
          <h2>2. 데이터 전송 테스트 (게임 기록)</h2>
          <input
            type="text"
            placeholder="유저 이름 (이메일)"
            value={record.userName}
            onChange={(e) => setRecord({ ...record, userName: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="난이도 (easy/medium/hard)"
            value={record.difficulty}
            onChange={(e) => setRecord({ ...record, difficulty: e.target.value })}
            style={inputStyle}
          />
          <p style={{ padding: "10px"}}>클리어 시간 (초) : </p>
          <input
            type="number"
            value={record.clearTime}
            onChange={(e) =>
              setRecord({ ...record, clearTime: Number(e.target.value) })
            }
            style={{...inputStyle, height: "35px"}}
          />
          <p style={{ padding: "10px"}}>뒤집기 횟수 : </p>
          <input
            type="number"
            value={record.flipCount}
            onChange={(e) =>
              setRecord({ ...record, flipCount: Number(e.target.value) })
            }
            style={{...inputStyle, height: "35px"}}
          />
          <div style={{ marginTop: "10px", gap: "20px" }}>
            <button type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // 부모 요소로 이벤트가 퍼지는 것을 막음
                handleSaveRecord();
              }}
              style={{ ...btnStyle, backgroundColor: "#2196F3" }}>
                저장 (Auth 체크)
            </button>
            <button onClick={handleLogout}
              style={{ ...btnStyle, backgroundColor: "#f44336" }}>
                로그아웃 (토큰삭제)
            </button>
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* 랭킹 조회 */}
        <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", gap: "20px" }}>
          <strong style={{paddingLeft: "5px"}}>Top 10 랭킹 조회 : </strong>
          <select
            value={difficultyR}
            onChange={(e) => {
              const nextDiff = e.target.value as Difficulty;
              setDifficultyRank(nextDiff); // 상태 변경
              handleGetRankings(nextDiff); // 변경될 값을 바로 인자로 넣어 실행!
            }}
            className="border px-2 py-1 rounded text-sm mx-auto mt-3 min-w-full">
              <option value="easy" selected>쉬움</option>
              <option value="normal">보통</option>
              <option value="hard">어려움</option>
          </select>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {rankings.map((r, idx) => {
              // 1. 순위 결정 로직
              let displayRank = idx + 1;
              
              if (idx > 0) {
                const prev = rankings[idx - 1];
                // 시간과 횟수가 모두 같다면 이전 사람의 순위와 동일하게 표시
                if (prev.clearTime === r.clearTime && prev.flipCount === r.flipCount) {
                  // 실제 서비스에서는 '공동'임을 표시하기 위해 로직을 더 짤 수 있습니다.
                  // 여기서는 이전 인덱스의 순위를 계산해서 가져오는 방식을 씁니다.
                  let rankOffset = 1;
                  while (idx - rankOffset >= 0) {
                    const p = rankings[idx - rankOffset];
                    if (p.clearTime === r.clearTime && p.flipCount === r.flipCount) {
                      displayRank = idx - rankOffset + 1;
                      rankOffset++;
                    } else {
                      break;
                    }
                  }
                }
              }

              // 1. 날짜 객체 생성
              const date = new Date(r.createdAt);
              
              // 2. 시간 포맷팅 (hh:mm:ss)
              // 'ko-KR'은 한국식 표현(오전/오후), hour12: false는 24시간제
              const timeString =
                date.getFullYear() + "." +
                (date.getMonth() + 1) + "." + // month는 0부터 시작
                date.getDate() + " " +
                date.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  //second: '2-digit',
                  hour12: false 
              });

              return (
                <li key={idx} className="grid grid-cols-[0.5fr_1fr_2fr_1fr] py-1">
                  <span>{displayRank}위</span>
                  <span style={{ fontWeight: 'bold' }}>{r.userName}</span>
                  <span className="text-right" style={{ marginLeft: '10px', color: '#888' }}>
                    [{timeString}] {/* 여기서 04:02:15 출력 */}
                  </span>
                  <span className="text-right" style={{ float: 'right', color: '#007bff' }}>
                    {r.clearTime}초/{r.flipCount}회
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 내 기록 조회 */}
        <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", gap: "20px" }}>
          <strong style={{paddingLeft: "5px"}}>내 기록 조회 : </strong> 
          <select
            value={difficultyMy}
            onChange={(e) => {
              const nextDiff = e.target.value as Difficulty;
              setDifficultyMy(nextDiff);
              handleGetMyRecords(nextDiff); // 변경될 값을 바로 인자로 넣어 실행!
            }}
            className="border px-2 py-1 rounded text-sm mx-auto mt-3 min-w-full">
              <option value="easy" selected>쉬움</option>
              <option value="normal">보통</option>
              <option value="hard">어려움</option>
          </select>
          <ol>
            {myRecords.map((r, idx) => {
              // 1. 날짜 객체 생성
              const date = new Date(r.createdAt); 
              
              // 2. 시간 포맷팅 (hh:mm:ss)
              // 'ko-KR'은 한국식 표현(오전/오후), hour12: false는 24시간제
              const timeString =
                date.getFullYear() + "." +
                (date.getMonth() + 1) + "." + // month는 0부터 시작
                date.getDate() + " " +
                date.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false 
              });

              return (
                <li key={idx} className="grid grid-cols-[1fr_1fr_2fr_1fr] py-1">
                  <span style={{ fontWeight: 'bold' }}>{r.userName}</span>
                  <span className="text-center">{r.difficulty}</span>
                  <span className="text-right" style={{ color: '#888' }}>
                    [{timeString}] {/* 여기서 04:02:15 출력 */}
                  </span>
                  <span className="text-right" style={{ float: 'right', color: '#007bff' }}>
                    {r.clearTime}초/{r.flipCount}회
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}

// 간단한 스타일링
const inputStyle = { display: "block", width: "100%", marginBottom: "10px", padding: "8px" };
const btnStyle = { padding: "10px", marginRight: "5px", cursor: "pointer", color: "white",
  border: "none", borderRadius: "4px", backgroundColor: "#333" };

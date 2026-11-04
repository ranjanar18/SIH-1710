import { useEffect, useState } from "react";
import { getNodes, getRoute } from "./api";
import MapView from "./components/MapView";
import AdminPanel from "./components/AdminPanel";
import { buildDirections, hasVoice, speak, stopSpeaking } from "./voice";

// Read the page address once: ?from=RST  ?kiosk=ENT  ?admin=1
const PARAMS = new URLSearchParams(window.location.search);
const KIOSK = PARAMS.get("kiosk");
const IS_ADMIN = PARAMS.get("admin") === "1";

const TEXT = {
  en: {
    title: "Smart Railway Station Navigation",
    from: "From: ",
    to: "To: ",
    wheelchair: "Wheelchair accessible route",
    find: "Find Route",
    distance: "Distance",
    meters: "m",
    speak: "🔊 Speak directions",
    stop: "⏹ Stop",
    noRoute: "No route available",
    noVoice: "No voice found for this language on your device.",
    youAre: "📍 You are at: ",
  },
  ta: {
    title: "ஸ்மார்ட் ரயில் நிலைய வழிகாட்டி",
    from: "தொடக்கம்: ",
    to: "இலக்கு: ",
    wheelchair: "சக்கர நாற்காலி வழி",
    find: "வழியைக் கண்டறி",
    distance: "தூரம்",
    meters: "மீ",
    speak: "🔊 வழிகாட்டலைக் கேள்",
    stop: "⏹ நிறுத்து",
    noRoute: "வழி இல்லை",
    noVoice: "இந்த மொழிக்கான குரல் உங்கள் சாதனத்தில் இல்லை.",
    youAre: "📍 நீங்கள் இருக்கும் இடம்: ",
  },
};

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [start, setStart] = useState("ENT");
  const [end, setEnd] = useState("PF1");
  const [accessible, setAccessible] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState("en");
  const [voiceOk, setVoiceOk] = useState(true);
  const [scanned, setScanned] = useState(null);

  const t = TEXT[lang];
  const label = (n) => (lang === "ta" ? n.name_ta : n.name_en);
  const big = KIOSK ? { fontSize: 22, padding: "10px 20px" } : {};

  const loadNodes = () => getNodes().then(setNodes);

  // Load places, then read ?from= / ?to= / ?kiosk= from the address
  useEffect(() => {
    getNodes().then((list) => {
      setNodes(list);
      const from = KIOSK || PARAMS.get("from");
      const to = PARAMS.get("to");
      if (from && list.some((n) => n.code === from)) {
        setStart(from);
        setScanned(from);
      }
      if (to && list.some((n) => n.code === to)) setEnd(to);
    });
  }, []);

  // Voice availability check
  useEffect(() => {
    const check = () => setVoiceOk(hasVoice(lang));
    check();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = check;
    }
  }, [lang]);

  // Kiosk: reset the screen after 60 seconds without a touch
  useEffect(() => {
    if (!KIOSK) return;
    let timer;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setRoute(null);
        setError(false);
        setAccessible(false);
        stopSpeaking();
      }, 60000);
    };
    window.addEventListener("click", reset);
    window.addEventListener("touchstart", reset);
    reset();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, []);

  const findRoute = async () => {
    setError(false);
    try {
      setRoute(await getRoute(start, end, accessible));
    } catch {
      setRoute(null);
      setError(true);
    }
  };

  const speakDirections = () => {
    if (!route) return;
    speak(buildDirections(route, lang).join(" "), lang);
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "30px auto",
        fontFamily: "sans-serif",
        fontSize: KIOSK ? 22 : 16,
      }}
    >
      <div style={{ textAlign: "right" }}>
        <button style={big} onClick={() => setLang("en")} disabled={lang === "en"}>English</button>{" "}
        <button style={big} onClick={() => setLang("ta")} disabled={lang === "ta"}>தமிழ்</button>
      </div>

      <h2>{t.title}</h2>

      {scanned && (
        <p style={{ background: "#e8f5e9", padding: 8, borderRadius: 6 }}>
          {t.youAre}
          <b>
            {label(
              nodes.find((n) => n.code === scanned) || { name_en: scanned, name_ta: scanned }
            )}
          </b>
        </p>
      )}

      {!KIOSK && (
        <>
          <label>{t.from}</label>
          <select value={start} onChange={(e) => setStart(e.target.value)}>
            {nodes.map((n) => (
              <option key={n.code} value={n.code}>{label(n)}</option>
            ))}
          </select>
          <br /><br />
        </>
      )}

      <label>{t.to}</label>
      <select style={big} value={end} onChange={(e) => setEnd(e.target.value)}>
        {nodes.map((n) => (
          <option key={n.code} value={n.code}>{label(n)}</option>
        ))}
      </select>

      <br /><br />
      <label>
        <input
          type="checkbox"
          checked={accessible}
          onChange={(e) => setAccessible(e.target.checked)}
        />{" "}
        {t.wheelchair}
      </label>

      <br /><br />
      <button style={big} onClick={findRoute}>{t.find}</button>

      {error && <p style={{ color: "red" }}>{t.noRoute}</p>}

      {route && (
        <div>
          <h3>{t.distance}: {route.distance_m} {t.meters}</h3>
          <ol>
            {route.steps.map((s) => (
              <li key={s.code}>{label(s)}</li>
            ))}
          </ol>

          <button style={big} onClick={speakDirections}>{t.speak}</button>{" "}
          <button style={big} onClick={stopSpeaking}>{t.stop}</button>
          {!voiceOk && <p style={{ color: "#b26a00" }}>{t.noVoice}</p>}
        </div>
      )}

      <MapView nodes={nodes} route={route} lang={lang} />

      {IS_ADMIN && (
        <AdminPanel
          nodes={nodes}
          onChanged={async () => {
            await loadNodes();
            setRoute(null);
          }}
        />
      )}
    </div>
  );
}
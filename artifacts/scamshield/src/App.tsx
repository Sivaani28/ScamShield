import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  Fingerprint,
  Link2,
  LockKeyhole,
  MessageCircleWarning,
  RotateCcw,
  ScanLine,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { analyzeMessage, type ScamAnalysis } from './scam-rules';

const MAX_LENGTH = 5000;
const MIN_LENGTH = 10;

const EXAMPLES = [
  {
    id: 'account',
    title: 'Account verification',
    note: 'Fictional example · high risk',
    message:
      'Example only: Metro Community Bank: Your account will be suspended today. Verify your password and one-time code at http://metrobank-verify.example immediately.',
  },
  {
    id: 'prize',
    title: 'Unexpected prize',
    note: 'Fictional example · high risk',
    message:
      'Example only: Congratulations, you have won a $500 reward! Act now and pay a small processing fee by gift card to claim your prize today. Keep this private.',
  },
  {
    id: 'everyday',
    title: 'Everyday information',
    note: 'Fictional example · lower risk',
    message:
      'Example only: The neighborhood library will close at 6 pm on Friday for a staff training day. Regular hours resume Saturday morning.',
  },
];

const categoryColor: Record<ScamAnalysis['category'], string> = {
  'Lower Risk': '#b9c1c8',
  Suspicious: '#d0a46f',
  'High Risk': '#d5787d',
};

function App() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [validation, setValidation] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scanTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
  }, []);

  const nonWhitespaceLength = message.trim().length;

  const runAnalysis = () => {
    if (message.length > MAX_LENGTH) {
      setValidation(`Keep the message under ${MAX_LENGTH.toLocaleString()} characters.`);
      return;
    }
    if (nonWhitespaceLength < MIN_LENGTH) {
      setValidation(`Add at least ${MIN_LENGTH} non-whitespace characters to analyze.`);
      return;
    }
    setValidation('');
    setAnalysis(null);
    setIsScanning(true);
    scanTimer.current = window.setTimeout(() => {
      setAnalysis(analyzeMessage(message));
      setIsScanning(false);
      scanTimer.current = null;
    }, 720);
  };

  const clearMessage = () => {
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    scanTimer.current = null;
    setMessage('');
    setAnalysis(null);
    setValidation('');
    setIsScanning(false);
  };

  const selectExample = (exampleText: string) => {
    setMessage(exampleText);
    setAnalysis(null);
    setValidation('');
  };

  const indicatorIcon = (id: string) =>
    id === 'link' ? <Link2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="ScamShield home" data-testid="link-home">
            <span className="brand-mark"><Shield aria-hidden="true" /></span>
            <span>Scam<span>Shield</span></span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#how-it-works" data-testid="link-how-it-works">How it works</a>
            <a href="#safety-tips" data-testid="link-safety-tips">Safety tips</a>
            <span className="privacy-chip"><LockKeyhole aria-hidden="true" /> Private by design</span>
          </nav>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="eyebrow">Spot the red flags before you click.</div>
          <h1 id="hero-title">Pause before<br /><span>you press send.</span></h1>
          <p className="hero-copy">
            Paste a message that doesn’t feel right. ScamShield checks for familiar warning signs,
            then explains what to look at next—without sending your text anywhere.
          </p>
          <div className="hero-features" aria-label="ScamShield features">
            <span><Clock3 aria-hidden="true" /> Quick local check</span>
            <span><MessageCircleWarning aria-hidden="true" /> Clear warning signs</span>
            <span><LockKeyhole aria-hidden="true" /> Private by design</span>
          </div>
          <a className="btn btn-primary hero-cta" href="#analyzer" data-testid="link-analyze">
            Analyze a Message <ChevronRight aria-hidden="true" />
          </a>
          <div className="local-note"><Fingerprint aria-hidden="true" /> Your message stays in this browser. Nothing is saved or shared.</div>
        </section>

        <section id="analyzer" className="analyzer-card" aria-labelledby="analyzer-title">
          <div className="card-head">
            <div className="card-title"><ScanLine aria-hidden="true" /><span id="analyzer-title">Check a message</span></div>
            <span className="step-label">LOCAL CHECK&nbsp; / &nbsp;01</span>
          </div>
          <div className="analyzer-body">
            <div className="input-label-row">
              <label className="input-label" htmlFor="message-input">Message text</label>
              <span className="input-hint">Paste the text only—do not open any links</span>
            </div>
            <textarea
              id="message-input"
              className="message-input"
              value={message}
              maxLength={MAX_LENGTH}
              disabled={isScanning}
              onChange={(event) => {
                setMessage(event.target.value);
                setValidation('');
                setAnalysis(null);
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runAnalysis();
              }}
              placeholder="Paste a suspicious text, email, or direct message here…"
              aria-describedby="input-help input-validation"
              aria-invalid={Boolean(validation)}
              data-testid="input-message"
            />
            <div className="input-meta">
              <span className="validation" id="input-validation" role="alert" data-testid="text-validation">{validation}</span>
              <span id="input-help" className={`char-count ${message.length > 4700 ? 'near-limit' : ''}`} aria-live="polite" data-testid="text-character-count">
                {message.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
            </div>

            <div className="sample-row" aria-label="Fictional sample messages">
              <span className="sample-label">TRY AN EXAMPLE</span>
              {EXAMPLES.map((example) => (
                <button
                  type="button"
                  className="sample-button"
                  key={example.id}
                  title={example.note}
                  onClick={() => selectExample(example.message)}
                  disabled={isScanning}
                  data-testid={`button-example-${example.id}`}
                >
                  {example.title}
                </button>
              ))}
            </div>
            <div className="action-row">
              <span className="action-note"><LockKeyhole aria-hidden="true" /> Analysis happens only on this device.</span>
              <div className="button-group">
                <button type="button" className="btn btn-ghost" onClick={clearMessage} data-testid="button-clear">
                  <RotateCcw aria-hidden="true" /> Clear
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={runAnalysis}
                  disabled={isScanning}
                  data-testid="button-analyze"
                >
                  <ScanLine aria-hidden="true" /> Check message <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {isScanning && (
            <div className="loading-status" role="status" aria-live="polite" data-testid="status-scanning">
              <span className="scan-dot" /> Checking for familiar patterns
              <span className="scan-line" />
              <span>LOCAL</span>
            </div>
          )}
        </section>

        {analysis && (
          <section className="results" aria-labelledby="result-title" aria-live="polite" data-testid="panel-results">
            <div className="results-top">
              <div>
                <h2 className="result-heading" id="result-title">Your message check</h2>
                <p className="result-subtitle" data-testid="text-summary">{analysis.summary}</p>
              </div>
              <div className="score-block" aria-label={`Risk score ${analysis.score} out of 100, ${analysis.category}`}>
                <div
                  className="score-ring"
                  style={{
                    '--score-color': categoryColor[analysis.category],
                    '--score-angle': `${analysis.score * 3.6}deg`,
                  } as CSSProperties}
                  aria-hidden="true"
                >
                  <span className="score-number" data-testid="text-score">{analysis.score}</span>
                </div>
                <div className="score-copy">
                  <span className="score-category" data-testid="text-risk-category">{analysis.category}</span>
                  <span className="score-caption">Pattern score</span>
                </div>
              </div>
            </div>
            <div className="result-grid">
              <div className="result-panel">
                <h3 className="panel-title"><MessageCircleWarning aria-hidden="true" /> What stood out</h3>
                {analysis.indicators.length ? (
                  <ul className="signal-list" data-testid="list-indicators">
                    {analysis.indicators.map((indicator) => (
                      <li className="signal-item" key={indicator.id} data-testid={`indicator-${indicator.id}`}>
                        {indicatorIcon(indicator.id)}
                        <span className="signal-copy">
                          <strong>{indicator.label}</strong>
                          <span>{indicator.detail}</span>
                          {indicator.matchedPhrase && (
                            <span className="signal-phrase">
                              Matched text: “{indicator.matchedPhrase}”
                            </span>
                          )}
                        </span>
                        <span className="signal-weight">+{indicator.points}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-signals" data-testid="text-no-indicators">
                    No common red flags were found in the text. This is not a safety guarantee—scams can use wording these checks do not recognize.
                  </div>
                )}
              </div>
              <div className="result-panel">
                <h3 className="panel-title"><ShieldCheck aria-hidden="true" /> A safer next step</h3>
                <ul className="advice-list" data-testid="list-advice">
                  {analysis.advice.map((item, index) => (
                    <li key={item} data-testid={`advice-item-${index}`}><Check aria-hidden="true" /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="result-disclaimer" data-testid="text-heuristic-disclaimer">
              A pattern-based estimate, not a verdict. These unvalidated rules can miss scams or flag legitimate messages. When unsure, verify with the organization using contact details you already trust.
            </p>
          </section>
        )}

        <section id="how-it-works" className="content-section" aria-labelledby="how-title">
          <div className="section-kicker">Simple by design</div>
          <h2 className="section-title" id="how-title">A useful pause, not a final verdict.</h2>
          <div className="how-grid">
            <article className="info-card">
              <span className="info-index">01 / PASTE</span>
              <h3>Keep it to the message</h3>
              <p>Copy the wording that concerns you. Never follow a suspicious link just to investigate it.</p>
            </article>
            <article className="info-card">
              <span className="info-index">02 / CHECK</span>
              <h3>See the signals</h3>
              <p>Local browser rules look for familiar patterns such as urgency, requests for codes, and payment pressure.</p>
            </article>
            <article className="info-card">
              <span className="info-index">03 / VERIFY</span>
              <h3>Choose a trusted route</h3>
              <p>Use a known phone number or type an official website address yourself before taking action.</p>
            </article>
          </div>
        </section>

        <section id="safety-tips" className="content-section" aria-labelledby="tips-title">
          <div className="tips-layout">
            <div>
              <div className="section-kicker">Keep control</div>
              <h2 className="section-title" id="tips-title">A few seconds can change the outcome.</h2>
              <p className="tip-intro">Scammers often want the same thing: your attention before you have time to think. You can always stop and verify.</p>
            </div>
            <div className="tip-list">
              <div className="tip-row"><Clock3 aria-hidden="true" /><div><strong>Let urgency wait</strong><span>Real organizations should not need you to panic, pay instantly, or decide in secret.</span></div></div>
              <div className="tip-row"><LockKeyhole aria-hidden="true" /><div><strong>Keep codes to yourself</strong><span>One-time codes and passwords are keys. A legitimate support agent will not need you to read them out.</span></div></div>
              <div className="tip-row"><Eye aria-hidden="true" /><div><strong>Check the sender independently</strong><span>Call a number on your card or statement, or use an official app you already have installed.</span></div></div>
              <div className="tip-row"><CircleHelp aria-hidden="true" /><div><strong>Ask someone you trust</strong><span>A second perspective can help you spot pressure you might miss when a message feels urgent.</span></div></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="main-content footer-inner">
          <div className="footer-brand">ScamShield <span>· A calmer second look</span></div>
          <div className="footer-disclaimer">No message leaves this page. ScamShield is an educational aid, not a security service. A low score does not mean a message is safe.</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

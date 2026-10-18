import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import axios from 'axios'
import diaryService from './diaryService'
import {
  visibilityOptions,
  weatherOptions,
  type DiaryEntry,
  type NewDiaryEntry,
  type Visibility,
  type Weather,
} from './types'
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  CloudIcon,
  EyeIcon,
  PlaneIcon,
  WeatherIcon,
} from './Icons'
import './App.css'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad = (value: number) => String(value).padStart(2, '0')

const todayIso = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`
}

const dateParts = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return { day: String(Number(day)), month: monthNames[Number(month) - 1], year }
}

interface SaveError {
  title: string
  details: string[]
}

const App = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [date, setDate] = useState(todayIso)
  const [weather, setWeather] = useState<Weather>('sunny')
  const [visibility, setVisibility] = useState<Visibility>('good')
  const [comment, setComment] = useState('')
  const [error, setError] = useState<SaveError | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    const loadEntries = async () => {
      try {
        const initialEntries = await diaryService.getAll()
        if (!cancelled) setEntries(initialEntries)
      } catch {
        if (!cancelled) setError({ title: 'Could not load the flight log', details: [] })
      }
    }

    void loadEntries()
    return () => {
      cancelled = true
      window.clearTimeout(toastTimer.current)
    }
  }, [])

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        b.date === a.date ? b.id - a.id : b.date.localeCompare(a.date),
      ),
    [entries],
  )

  const commonWeather = useMemo(() => {
    if (entries.length === 0) return null
    const counts = new Map<Weather, number>()
    entries.forEach((entry) => counts.set(entry.weather, (counts.get(entry.weather) ?? 0) + 1))
    return [...counts.entries()].reduce((best, current) => (current[1] > best[1] ? current : best))[0]
  }, [entries])

  const createEntry = async (event: SyntheticEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    const newEntry: NewDiaryEntry = { date, weather, visibility, comment }

    try {
      const returnedEntry = await diaryService.create(newEntry)
      setEntries((currentEntries) => currentEntries.concat(returnedEntry))
      setSavedId(returnedEntry.id)
      setComment('')
      setToast(formatDate(returnedEntry.date))
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToast(null), 3400)
    } catch (requestError: unknown) {
      if (axios.isAxiosError<{ error?: Array<{ message?: string }> }>(requestError)) {
        const issues = requestError.response?.data?.error
        const details = Array.isArray(issues)
          ? issues.map((issue) => issue.message ?? '').filter(Boolean)
          : []
        setError({ title: 'Could not save the entry', details })
      } else {
        setError({ title: 'Could not save the entry', details: [] })
      }
    } finally {
      setSaving(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <main>
      <header className="hero">
        <svg className="hero__path" viewBox="0 0 640 200" fill="none" aria-hidden="true">
          <path
            d="M-10 150 C 140 60, 300 50, 460 92 S 620 132, 660 96"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="6 7"
          />
          <circle cx="628" cy="101" r="4" fill="rgba(255, 255, 255, 0.85)" />
        </svg>
        <div className="hero__top">
          <span className="logo">
            <PlaneIcon size={20} />
          </span>
          <p className="eyebrow">Flight log / {year}</p>
        </div>
        <h1>Ilari&apos;s flight diaries</h1>
        <p className="intro">A clear record of the sky, one landing at a time.</p>
        <dl className="stats">
          <div className="stat">
            <dt>Flights logged</dt>
            <dd>{entries.length}</dd>
          </div>
          <div className="stat">
            <dt>Last flight</dt>
            <dd>{sortedEntries.length > 0 ? formatDate(sortedEntries[0].date) : '—'}</dd>
          </div>
          <div className="stat">
            <dt>Common skies</dt>
            <dd>
              {commonWeather ? (
                <>
                  <WeatherIcon weather={commonWeather} size={17} />
                  {commonWeather}
                </>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>
      </header>

      <section className="layout">
        <div className="panel">
          <div className="panel__head">
            <h2>Recorded flights</h2>
            <span className="count">{entries.length}</span>
          </div>

          {entries.length === 0 ? (
            <div className="empty">
              <CloudIcon size={44} />
              <p>No flights logged yet. Add your first one!</p>
            </div>
          ) : (
            <ol className="entries">
              {sortedEntries.map((entry) => {
                const { day, month, year: entryYear } = dateParts(entry.date)
                return (
                  <li
                    key={entry.id}
                    className={`entry weather-${entry.weather}${entry.id === savedId ? ' entry--new' : ''}`}
                  >
                    <div className="entry__date" aria-hidden="true">
                      <span className="entry__day">{day}</span>
                      <span className="entry__month">
                        {month} {entryYear}
                      </span>
                    </div>
                    <div className="entry__body">
                      <div className="entry__meta">
                        <span className="weather-tag">
                          <WeatherIcon weather={entry.weather} size={15} />
                          {entry.weather}
                        </span>
                        <span className={`visibility-tag visibility-${entry.visibility}`}>
                          <i className="dot" />
                          {entry.visibility} visibility
                        </span>
                      </div>
                      <p className="entry__sr-date">
                        {formatDate(entry.date)} — {entry.weather}, visibility {entry.visibility}
                      </p>
                      {entry.comment && <p className="entry__comment">&ldquo;{entry.comment}&rdquo;</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <form className="panel entry-form" onSubmit={createEntry}>
          <div className="panel__head">
            <h2>Add a flight</h2>
            <PlaneIcon className="form__plane" size={20} />
          </div>

          {error && (
            <div className="alert" role="alert">
              <AlertIcon size={18} />
              <div>
                <strong>{error.title}</strong>
                {error.details.length > 0 && (
                  <ul>
                    {error.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <label className="field" htmlFor="date">
            <span className="field__label">
              <CalendarIcon size={14} />
              Date
            </span>
            <input
              id="date"
              type="date"
              value={date}
              max={todayIso()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <fieldset className="field group">
            <legend className="field__label">Weather</legend>
            <div className="chips">
              {weatherOptions.map((option) => (
                <label
                  key={option}
                  className={`chip-selectable weather-${option}${weather === option ? ' is-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="weather"
                    value={option}
                    checked={weather === option}
                    onChange={() => setWeather(option)}
                  />
                  <WeatherIcon weather={option} size={21} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field group">
            <legend className="field__label">
              <EyeIcon size={14} />
              Visibility
            </legend>
            <div className="pills">
              {visibilityOptions.map((option) => (
                <label
                  key={option}
                  className={`pill-selectable visibility-${option}${visibility === option ? ' is-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={visibility === option}
                    onChange={() => setVisibility(option)}
                  />
                  <i className="dot" />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field" htmlFor="comment">
            <span className="field__label">
              Comment <em>optional</em>
            </span>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              placeholder="Anything worth remembering about this flight?"
              onChange={(event) => setComment(event.target.value)}
            />
          </label>

          <button type="submit" className="submit" disabled={saving}>
            {saving ? (
              'Saving…'
            ) : (
              <>
                <PlaneIcon size={18} />
                Save entry
              </>
            )}
          </button>
        </form>
      </section>

      {toast && (
        <div className="toast" role="status">
          <CheckIcon size={18} />
          Flight logged — {toast}
        </div>
      )}
    </main>
  )
}

export default App

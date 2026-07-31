import { useEffect, useMemo, useState } from 'react'

const tags = ['all', 'comfort', 'mystery', 'space', 'family', 'documentary']

export default function App() {
  const [titles, setTitles] = useState([])
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('all')
  const [view, setView] = useState('waiting')
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState({ title: '', format: 'movie', tag: 'comfort' })

  const load = async () => {
    const response = await fetch('/api/titles')
    setTitles(await response.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const visible = useMemo(() => titles.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesTag = tag === 'all' || item.tag === tag
    const matchesView = view === 'all' || (view === 'watched' ? item.watched : !item.watched)
    return matchesSearch && matchesTag && matchesView
  }), [titles, search, tag, view])

  const toggle = async (item) => {
    const response = await fetch(`/api/titles/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ watched: !item.watched }),
    })
    const updated = await response.json()
    setTitles(current => current.map(value => value.id === item.id ? updated : value))
  }

  const add = async (event) => {
    event.preventDefault()
    const response = await fetch('/api/titles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    if (!response.ok) return
    const created = await response.json()
    setTitles(current => [created, ...current])
    setDraft(current => ({ ...current, title: '' }))
    setView('waiting')
  }

  return <main>
    <header>
      <div><p className="eyebrow">Lantern</p><h1>Good things to watch next.</h1></div>
      <p className="summary"><strong>{titles.filter(item => !item.watched).length}</strong> waiting when the evening opens up.</p>
    </header>

    <section className="controls" aria-label="Watchlist controls">
      <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search titles" aria-label="Search titles" />
      <div className="segmented">
        {['waiting', 'watched', 'all'].map(value => <button className={view === value ? 'active' : ''} key={value} onClick={() => setView(value)}>{value}</button>)}
      </div>
    </section>

    <nav className="tags" aria-label="Filter by mood">
      {tags.map(value => <button className={tag === value ? 'active' : ''} key={value} onClick={() => setTag(value)}>{value}</button>)}
    </nav>

    {loading ? <p className="empty">Loading your list...</p> : <section className="grid">
      {visible.map((item, index) => <article className={`card tone-${(Number(item.id) + index) % 5}`} key={item.id}>
        <div className="poster" aria-hidden="true"><span>{item.title.split(' ').filter(word => word.length > 2).slice(0, 2).map(word => word[0]).join('')}</span></div>
        <div className="card-copy"><div className="meta"><span>{item.format}</span><span>{item.tag}</span></div><h2>{item.title}</h2><button className="watch" onClick={() => toggle(item)}>{item.watched ? 'Put it back' : 'Mark watched'}</button></div>
      </article>)}
      {!visible.length && <p className="empty">Nothing matches yet. Try another mood.</p>}
    </section>}

    <section className="add-panel">
      <div><p className="eyebrow">Add one</p><h2>What did someone recommend?</h2></div>
      <form onSubmit={add}>
        <input required maxLength="120" value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} placeholder="Title" />
        <select value={draft.format} onChange={event => setDraft({ ...draft, format: event.target.value })}><option value="movie">movie</option><option value="show">show</option></select>
        <select value={draft.tag} onChange={event => setDraft({ ...draft, tag: event.target.value })}>{tags.slice(1).map(value => <option key={value}>{value}</option>)}</select>
        <button>Add to watchlist</button>
      </form>
    </section>
  </main>
}

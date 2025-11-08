import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddEventForm({ gameId, players, events }) {
  const [playerId, setPlayerId] = useState('')
  const [eventType, setEventType] = useState('shot')
  const [made, setMade] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!playerId) return alert('Select a player first.')

    setLoading(true)
    const { error } = await supabase.from('events').insert([
      {
        game_id: gameId,
        player_id: playerId,
        type: eventType,
        made,
        quarter: 1,
        x: Math.random() * 50, // mock coords
        y: Math.random() * 50,
        event_time: new Date(),
        created_by: events.user.id,
      },
    ])
    setLoading(false)

    if (error) console.error(error)
    else alert('Event added!')
  }
  return (
    <form onSubmit={handleSubmit} className="card mt-4">
      <h2 className="text-xl font-bold mb-2">Add Event</h2>

      <label>Player</label>
      <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
        <option value="">Select player</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>
            #{p.number} - {p.name_first} {p.name_last}
          </option>
        ))}
      </select>

      <label>Event Type</label>
      <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
        <option value="shot">Shot</option>
        <option value="rebound">Rebound</option>
        <option value="assist">Assist</option>
        <option value="turnover">Turnover</option>
        <option value="foul">Foul</option>
      </select>

      {eventType === 'shot' && (
        <label>
          <input
            type="checkbox"
            checked={made}
            onChange={(e) => setMade(e.target.checked)}
          />
          Made shot?
        </label>
      )}

      <button disabled={loading} type="submit">
        {loading ? 'Saving...' : 'Add Event'}
      </button>
    </form>
  )
}

// src/hooks/useEventManager.js
import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'

export default function useEventManager( setEvents, events, selectedGameId = null, selectedRole ) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedGameId) return;

    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          player: players!events_player_id_fkey(name_first, name_last, number),
          assister: players!events_assistPlayer_id_fkey(name_first, name_last, number)
        `)
        .eq('game_id', selectedGameId)
        .order('event_time', { ascending: true });

      console.log("Fetched events for game:", selectedGameId, data);

      if (error) console.error('Error fetching events:', error);
      else setEvents(data || []);
    }

    function subscribeToChanges() {
      const channel = supabase
        .channel(`realtime:events:game_${selectedGameId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
            filter: `game_id=eq.${selectedGameId}`,
          },
          (payload) => {
            console.log("Realtime update received:", payload);
            fetchEvents();
          }
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    }

    fetchEvents();
    const cleanup = subscribeToChanges();
    return cleanup;
  }, [selectedGameId]);

  const sortedEvents = useMemo(() => {
    if (!events.length) return [];
    return [...events].sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date
          ? a.createdAt
          : a.createdAt?.toDate?.() ?? new Date(0);
      const dateB =
        b.createdAt instanceof Date
          ? b.createdAt
          : b.createdAt?.toDate?.() ?? new Date(0);
      return dateA - dateB;
    });
  }, [events]);

  async function handleUndoEvent() {
    if (events.length === 0) return;
    
    const allowedRoles = ["admin", "homeOffense", "awayOffense", "homeDefense", "awayDefense"];
    if (!allowedRoles.includes(selectedRole)) {
      alert("User role not permitted to undo events.");
      return;
    }

    let eventToDelete;
    let eventIndexToDelete = -1;

    if (selectedRole === "admin") {
      eventIndexToDelete = events.length - 1;
      eventToDelete = events[eventIndexToDelete];
    } else {
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].role === selectedRole) {
          eventIndexToDelete = i;
          eventToDelete = events[i];
          break;
        }
      }

      if (!eventToDelete) {
        alert(`${selectedRole} role: has no logs to undo.`);
        return;
      }
    }

    if (selectedGameId && eventToDelete?.id) {
      const originalEvents = [...events];
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
      
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventToDelete.id)
          .eq('game_id', selectedGameId);

        if (error) throw error;
      

      } catch (err) {
        console.error("Error deleting event, rolling back UI:", err.message || err);
        setEvents(originalEvents);
        alert("Failed to delete event from database. Rolled back UI.");
      }
    }
  }

  async function handleAddEvent(eventData) {
    //console.log("eventData", eventData)
    const newEvent = { ...eventData, id: crypto.randomUUID() };
    setEvents(prevEvents => [...prevEvents, newEvent]);

    const { error: supabaseError } = await supabase.from('events').insert([
        { ...eventData },
    ]);

    if (supabaseError) {
        console.error(supabaseError);
        setError(supabaseError.message);
        setEvents(prevEvents => prevEvents.filter(e => e.id !== newEvent.id));
    }
}

  return {
    sortedEvents,
    handleAddEvent,
    handleUndoEvent,
    loading,
    error,
  }
}
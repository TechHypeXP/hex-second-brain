import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchResources = async () => {
    if (!user) {
      setResources([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          spaces(name, color),
          classifications(name, code)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      setError(error.message)
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const addResource = async (resourceData) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resourceData,
          user_id: user.id
        }])
        .select(`
          *,
          spaces(name, color),
          classifications(name, code)
        `)
        .single()

      if (error) throw error
      
      setResources(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      console.error('Error adding resource:', error)
      return { data: null, error: error.message }
    }
  }

  const updateResource = async (id, updates) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          spaces(name, color),
          classifications(name, code)
        `)
        .single()

      if (error) throw error
      
      setResources(prev => 
        prev.map(resource => 
          resource.id === id ? data : resource
        )
      )
      return { data, error: null }
    } catch (error) {
      console.error('Error updating resource:', error)
      return { data: null, error: error.message }
    }
  }

  const deleteResource = async (id) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setResources(prev => prev.filter(resource => resource.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting resource:', error)
      return { error: error.message }
    }
  }

  const searchResources = async (query) => {
    if (!user || !query.trim()) {
      return { data: [], error: null }
    }

    try {
      const { data, error } = await supabase
        .rpc('search_resources', {
          search_query: query,
          user_uuid: user.id
        })

      if (error) throw error
      
      // Log search query for analytics
      await supabase
        .from('search_queries')
        .insert([{
          query: query,
          results_count: data?.length || 0,
          user_id: user.id
        }])

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error searching resources:', error)
      return { data: [], error: error.message }
    }
  }

  useEffect(() => {
    fetchResources()
  }, [user])

  return {
    resources,
    loading,
    error,
    fetchResources,
    addResource,
    updateResource,
    deleteResource,
    searchResources
  }
}

export const useSpaces = () => {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchSpaces = async () => {
    if (!user) {
      setSpaces([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSpaces(data || [])
    } catch (error) {
      setError(error.message)
      console.error('Error fetching spaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSpace = async (spaceData) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('spaces')
        .insert([{
          ...spaceData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error
      
      setSpaces(prev => [data, ...prev])
      return { data, error: null }
    } catch (error) {
      console.error('Error adding space:', error)
      return { data: null, error: error.message }
    }
  }

  const updateSpace = async (id, updates) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('spaces')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setSpaces(prev => 
        prev.map(space => 
          space.id === id ? data : space
        )
      )
      return { data, error: null }
    } catch (error) {
      console.error('Error updating space:', error)
      return { data: null, error: error.message }
    }
  }

  const deleteSpace = async (id) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      setSpaces(prev => prev.filter(space => space.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting space:', error)
      return { error: error.message }
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [user])

  return {
    spaces,
    loading,
    error,
    fetchSpaces,
    addSpace,
    updateSpace,
    deleteSpace
  }
}

export const useClassifications = () => {
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClassifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .order('name')

      if (error) throw error
      setClassifications(data || [])
    } catch (error) {
      setError(error.message)
      console.error('Error fetching classifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClassifications()
  }, [])

  return {
    classifications,
    loading,
    error,
    fetchClassifications
  }
}


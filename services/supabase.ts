import { createClient } from '@supabase/supabase-js';
import { Attendee, EventMetadata } from '../types';

console.log('supabase.ts: Carregando variáveis de ambiente...');
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Attendees functions
export async function fetchAttendees(): Promise<Attendee[]> {
    const { data, error } = await supabase
        .from('attendees')
        .select('*')
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Error fetching attendees:', error);
        return [];
    }

    return data || [];
}

export async function addAttendee(attendee: Attendee): Promise<boolean> {
    console.log('supabase.ts: Tentando adicionar participante:', attendee);
    const { error } = await supabase
        .from('attendees')
        .insert([attendee]);

    if (error) {
        console.error('ERRO Supabase (addAttendee):', error.message, error.details, error.hint);
        return false;
    }

    return true;
}

export async function updateAttendee(attendee: Attendee): Promise<boolean> {
    console.log('supabase.ts: Tentando atualizar participante:', attendee);
    const { error } = await supabase
        .from('attendees')
        .update(attendee)
        .eq('id', attendee.id);

    if (error) {
        console.error('ERRO Supabase (updateAttendee):', error.message, error.details, error.hint);
        return false;
    }

    return true;
}


export async function deleteAttendee(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting attendee:', error);
        return false;
    }

    return true;
}

export async function clearAllAttendees(): Promise<boolean> {
    const { error } = await supabase
        .from('attendees')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
        console.error('Error clearing attendees:', error);
        return false;
    }

    return true;
}

// Event Metadata functions
export async function fetchEventMetadata(): Promise<EventMetadata | null> {
    const { data, error } = await supabase
        .from('event_metadata')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching event metadata:', error);
        return null;
    }

    return data || null;
}

export async function saveEventMetadata(metadata: EventMetadata): Promise<boolean> {
    console.log('supabase.ts: Salvando metadados:', metadata);

    // First, try to get existing metadata to get its ID
    const { data: existing, error: fetchError } = await supabase
        .from('event_metadata')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('ERRO Supabase (fetch metadata before save):', fetchError.message);
    }

    const payload = {
        ...metadata,
        updated_at: new Date().toISOString()
    };

    let result;
    if (existing?.id) {
        console.log('supabase.ts: Atualizando registro existente ID:', existing.id);
        result = await supabase
            .from('event_metadata')
            .update(payload)
            .eq('id', existing.id);
    } else {
        console.log('supabase.ts: Criando novo registro de metadados');
        result = await supabase
            .from('event_metadata')
            .insert([payload]);
    }

    if (result.error) {
        console.error('ERRO Supabase (saveEventMetadata):', result.error.message, result.error.details);
        return false;
    }

    return true;
}

export async function clearEventMetadata(): Promise<boolean> {
    const { error } = await supabase
        .from('event_metadata')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
        console.error('Error clearing event metadata:', error);
        return false;
    }

    return true;
}

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { question, context, conversationType = 'quick_insight' } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log('Processing AI request:', { question, conversationType, userId: user.id });

    // Create the system prompt based on conversation type
    let systemPrompt = '';
    
    if (conversationType === 'quick_insight') {
      systemPrompt = `You are a strategic business advisor providing quick, actionable insights. 
      
      Context about the user's business metrics: ${JSON.stringify(context)}
      
      Provide a brief, actionable response (2-3 sentences max) that directly addresses their question while considering their current metrics. Focus on immediate, practical advice.`;
    } else {
      systemPrompt = `You are a strategic business advisor providing comprehensive analysis and recommendations.
      
      Context about the user's business metrics: ${JSON.stringify(context)}
      
      Provide detailed, strategic analysis with specific recommendations. Consider trends, patterns, and long-term implications. Be thorough but practical.`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: conversationType === 'quick_insight' ? 150 : 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store the conversation in the database
    const { error: insertError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        question,
        response: aiResponse,
        context,
        conversation_type: conversationType
      });

    if (insertError) {
      console.error('Error storing conversation:', insertError);
      // Don't throw here, just log the error
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI strategic analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
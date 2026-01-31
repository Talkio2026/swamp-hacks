import { createClient } from "@deepgram/sdk";

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

export interface TranscriptionWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  speaker: number;
}

export interface TranscriptionUtterance {
  speaker: number;
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface DeepgramTranscriptionResult {
  utterances: TranscriptionUtterance[];
  words: TranscriptionWord[];
  fullTranscript: string;
  confidence: number;
  duration: number;
}

/**
 * Transcribe audio from a URL using Deepgram
 * Optimized for phone calls with speaker diarization
 */
export async function transcribeWithDeepgram(
  audioUrl: string,
  options?: {
    language?: string;
    model?: string;
  }
): Promise<DeepgramTranscriptionResult | null> {
  if (!deepgramApiKey) {
    console.error("[Deepgram] Missing DEEPGRAM_API_KEY");
    return null;
  }

  try {
    const deepgram = createClient(deepgramApiKey);

    console.log(`[Deepgram] Transcribing audio from: ${audioUrl}`);

    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        // Model optimized for phone calls
        model: options?.model || "nova-2-phonecall",
        language: options?.language || "en-US",
        // Enable speaker diarization (identify different speakers)
        diarize: true,
        // Enable punctuation and formatting
        punctuate: true,
        // Enable utterance detection (natural speech segments)
        utterances: true,
        // Smart formatting (numbers, dates, etc)
        smart_format: true,
        // Filler words (um, uh, etc) - keep them for authenticity
        filler_words: true,
        // Multichannel for stereo recordings (rep on one channel, client on other)
        multichannel: true,
      }
    );

    if (error) {
      console.error("[Deepgram] Transcription error:", error);
      return null;
    }

    const channel = result.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];

    if (!alternative) {
      console.error("[Deepgram] No transcription result");
      return null;
    }

    // Extract utterances with speaker info
    const utterances: TranscriptionUtterance[] = (result.results?.utterances || []).map(
      (u: { speaker: number; transcript: string; start: number; end: number; confidence: number }) => ({
        speaker: u.speaker,
        text: u.transcript,
        start: u.start,
        end: u.end,
        confidence: u.confidence,
      })
    );

    // Extract words with timing
    const words: TranscriptionWord[] = (alternative.words || []).map(
      (w: { word: string; start: number; end: number; confidence: number; speaker: number }) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
        speaker: w.speaker,
      })
    );

    const transcriptionResult: DeepgramTranscriptionResult = {
      utterances,
      words,
      fullTranscript: alternative.transcript || "",
      confidence: alternative.confidence || 0,
      duration: result.metadata?.duration || 0,
    };

    console.log(
      `[Deepgram] Transcription complete: ${utterances.length} utterances, ` +
        `${words.length} words, confidence: ${(transcriptionResult.confidence * 100).toFixed(1)}%`
    );

    return transcriptionResult;
  } catch (error) {
    console.error("[Deepgram] Error:", error);
    return null;
  }
}

/**
 * Convert Deepgram utterances to our conversation format
 * Uses alternating pattern based on position in the conversation:
 * - First utterance (index 0) = Client (they answer the phone with "Hello?")
 * - Second utterance (index 1) = Sales Rep
 * - Third utterance (index 2) = Client
 * - And so on...
 * 
 * This is more reliable than Deepgram's speaker diarization which can be inconsistent.
 */
export function deepgramToConversation(
  utterances: TranscriptionUtterance[],
  firstSpeakerIsRep: boolean = false // kept for backwards compatibility but ignored
): { speaker: "sales_representative" | "client"; text: string; start: number; end: number }[] {
  return utterances.map((u, index) => ({
    // Even indices (0, 2, 4...) = Client, Odd indices (1, 3, 5...) = Sales Rep
    speaker: index % 2 === 0 ? "client" : "sales_representative",
    text: u.text,
    start: u.start,
    end: u.end,
  }));
}

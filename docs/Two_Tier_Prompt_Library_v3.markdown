# Two-Tier Prompt Library for Second Brain (Phase 1)

## Prompt #1: Factual Extractor, Sampler & Estimator (Gemini 2.5 Flash/Lite)
- **Settings**: Grounding with Google Search enabled.
- **Task**:
  ```
  Given resource: { type: '{resource.type}', transcript: '{resource.transcript}', description: '{description}' }, user_id: {user_id}, config: { embeddingModel: '{systemConfig.embeddingModel}', chunkSize: {systemConfig.chunkSize} }, perform:
  1. Analyze transcript and description, using grounding to verify entities (names, companies, URLs).
  2. Extract factual summary, key points, resources, keywords, search intent, quotes, structured intelligence, suggested categories (e.g., ["Technology > AI", "Business > Productivity"]), suggested tags (e.g., ["AI", "productivity"]), and suggested entities (e.g., ["AI", "Google"]).
  3. Generate representative sample (12 sentences: first 4, middle 4, last 4, 200–500 words).
  4. Calculate processing metrics: source_word_count, estimated_input_tokens (word_count * 1.3), tier_1_cost_estimate_usd ($0.50/M tokens).
  Return raw Markdown:
  processing_metrics:
    source_word_count: [Integer]
    estimated_input_tokens: [Integer]
    tier_1_cost_estimate_usd: [Float]
  Header:
    Title: [String]
    Creator/Presenter Name: [String]
    Source URL: [String]
    description_analyzed: [Boolean]
  Strategic Context:
    Establish the Strategic Context: [2-3 sentences]
    Explain the Timeliness: [2-3 sentences]
  Overview: [3-4 paragraph narrative]
  Key Points:
    Theme/Topic 1 ([Timestamp]):
      Strategic Purpose: [String]
      Detailed point 1a: [String]
    [Continue for all themes]
  Resources:
    Referenced materials: [Array]
    Related links: [Array]
    Additional reading: [Array]
  Keywords:
    Main keywords: [Array, 5-7 items]
    Long-tail keywords: [Array, 3-5 items]
    LSI keywords: [Array, 3-5 items]
  Search Intent Alignment:
    Top 5 Google "People Also Ask" questions: [Array]
    Top 5 Google "People Also Search" terms: [Array]
  Quotes:
    Notable quotes from the content: [Array with timestamps]
  Structured Intelligence Extraction:
    Statistics: [Array]
    Key Figures: [Array]
    Referenced Entities: [Array]
    Verifiable Claims/Findings: [Array]
  Suggested Categories: [Array, e.g., ["Technology > AI", "Business > Productivity"]]
  Suggested Tags: [Array, e.g., ["AI", "productivity", "video"]]
  Suggested Entities: [Array, e.g., ["AI", "Google"]]
  representative_sample:
    instructions: [12 sentences: first 4, middle 4, last 4]
    sample_text: [String, 200–500 words]
    sample_word_count: [Integer]
    sample_percentage_of_source: [Float]
  ```
- **Error Handling**: Retry API call 3 times with 1-second delay. Log errors to `prompt_logs`.
- **Optimization**: Cache results in Supabase for 24 hours. Use chunk size: videos (250), articles (300), PDFs/OneNote (200).

## Prompt #2: Validator & Analyst (Gemini 2.5 Pro)
- **Settings**: Grounding not required.
- **Task**:
  ```
  Given summary_document: {JSON from Prompt #1}, user_id: {user_id}, config: { embeddingModel: '{systemConfig.embeddingModel}', validationWeights: {JSON.stringify(systemConfig.validationWeights)} }, perform:
  1. Compare summary to representative_sample, scoring (1–10):
     - factual_consistency
     - tonal_alignment
     - key_entity_presence
     - conclusion_congruence
  2. Set validation_status: "FAIL" if any score ≤6, else "PASS".
  3. Calculate overall_confidence_score (weighted average).
  4. Calculate tier_2_cost_estimate_usd ($5.00/M tokens).
  5. If PASS, generate foresight: questions, tangents, applications.
  6. Validate and refine suggested categories (select up to 5, mapped to classifications.code) and tags (stored in resources.tags, content_summaries.semantic_tags).
  7. Generate knowledge graph data: entities (for knowledge_nodes), relationships (for knowledge_edges, content_relationships).
  Return raw Markdown:
  validation_status: [String]
  overall_confidence_score: [Float]
  pass_fail_reason: [String]
  metric_scores:
    factual_consistency: [Integer]
    tonal_alignment: [Integer]
    key_entity_presence: [Integer]
    conclusion_congruence: [Integer]
  tier_2_cost_estimate_usd: [Float]
  foresight:
    questions: [Array]
    tangents: [Array]
    applications: [Array]
  final_categories: [Array, e.g., ["TECH.AI", "BUS.PROD"]]
  final_tags: [Array, e.g., ["AI", "productivity"]]
  knowledge_graph:
    entities: [Array, e.g., ["AI", "Google"]]
    relationships: [Array, e.g., [{ source: "AI", target: "Google", type: "related_to" }]]
  ```
- **Error Handling**: Same as Prompt #1.
- **Optimization**: Same as Prompt #1.
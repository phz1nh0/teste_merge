from mistralai.client import MistralClient
from config import get_config

config = get_config()
client = MistralClient(api_key=config.MISTRAL_API_KEY)


def gerar_resumo(problema_relatado: str) -> str:
    """
    Gera um resumo conciso do problema relatado pelo cliente.
    """
    try:
        prompt = (
            f"Resuma o seguinte problema relatado de forma concisa e "
            f"técnica, focando nos pontos principais: {problema_relatado}"
        )
        response = client.chat(
            model="mistral-large-latest", messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Erro ao gerar resumo: {e}")
        return "Resumo não disponível."


def gerar_pre_diagnostico(
    tipo_aparelho: str, marca_modelo: str, problema_relatado: str
) -> str:
    """
    Gera um pré-diagnóstico baseado nas informações do aparelho e problema.
    """
    try:
        prompt = (
            "Act as a senior computer and smartphone repair technician, focused on fast bench-level diagnosis.\n\n"
            "Service context:\n"
            f"- Device: {tipo_aparelho} {marca_modelo}\n"
            f"- Reported issue: {problema_relatado}\n\n"
            "Mandatory rules:\n"
            "- DO NOT repeat the reported issue.\n"
            "- DO NOT rewrite or summarize the context.\n"
            "- Write in plain text only (no lists, no markdown, no symbols).\n"
            "- Start by stating the main suspected cause.\n"
            "- Use extremely concise, technical language.\n"
            "- Limit the entire response to a maximum of 60 words.\n"
            "- Avoid explanations, background, or theory.\n\n"
            "Response language:\n"
            "- The entire response MUST be written in Brazilian Portuguese.\n\n"
            "Mandatory response format:\n"
            "Paragraph 1: One short sentence stating the most likely cause.\n\n"
            "Paragraph 2: One short sentence stating the first diagnostic check.\n\n"
            "Insert exactly one blank line between paragraphs.\n\n"
            "End with exactly:\n\n"
            "Suspeitos principais:\n"
            "1) <causa> – Testar: <teste direto>\n"
            "2) <causa> – Testar: <teste direto>\n\n"
            "Goal:\n"
            "Deliver a minimal, actionable diagnosis for an experienced repair technician."
            # "Act as a highly experienced computer and smartphone repair technician, focused on fast, practical, bench-level diagnosis.\n\n"
            # "Service context:\n"
            # f"- Device: {tipo_aparelho} {marca_modelo}\n"
            # f"- Reported issue: {problema_relatado}\n\n"
            # "Mandatory rules:\n"
            # "- DO NOT repeat the reported issue.\n"
            # "- DO NOT rewrite or summarize the context.\n"
            # "- Write the diagnosis in plain text only (no lists, no markdown, no symbols such as **, *, or _).\n"
            # "- Always start by clearly stating the main suspected cause, never an action.\n"
            # "- Only suggest actions after a suspected cause has been identified.\n"
            # "- Use direct, technical, bench-level language.\n"
            # "- Always think as a repair technician (test before replacing parts).\n"
            # "- Avoid theoretical, generic, or explanatory content.\n\n"
            # "Response language:\n"
            # "- The entire response MUST be written in Brazilian Portuguese.\n\n"
            # "Mandatory response format:\n"
            # "Paragraph 1: One concise technical paragraph stating the most likely cause.\n\n"
            # "Paragraph 2: One concise paragraph describing the immediate diagnostic or corrective action related to the cause above.\n\n"
            # "Leave exactly one blank line between paragraphs.\n\n"
            # "At the end, include exactly the following structure, without formatting:\n\n"
            # "Suspeitos principais:\n"
            # "1) <causa objetiva> – Testar: <teste prático direto>\n"
            # "2) <causa objetiva> – Testar: <teste prático direto>\n\n"
            # "Goal:\n"
            # "Deliver a fast, actionable, decision-oriented technical diagnosis suitable for bench repair."
        )
        response = client.chat(
            model="mistral-large-latest", messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Erro ao gerar pré-diagnóstico: {e}")
        return "Pré-diagnóstico não disponível."

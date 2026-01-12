import google.generativeai as genai
from config import get_config

config = get_config()
genai.configure(api_key=config.GEMINI_API_KEY)


def gerar_resumo(problema_relatado: str) -> str:
    """
    Gera um resumo conciso do problema relatado pelo cliente.
    """
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            f"Resuma o seguinte problema relatado de forma concisa e "
            f"técnica, focando nos pontos principais: {problema_relatado}"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
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
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "Act as a highly experienced and analytical computer and smartphone repair specialist.\n\n"
            "Service context:\n"
            f"- Device: {tipo_aparelho} {marca_modelo}\n"
            f"- Reported symptom / issue: {problema_relatado}\n\n"
            "Mandatory rules:\n"
            "- DO NOT repeat the reported issue.\n"
            "- DO NOT rewrite or summarize the context.\n"
            "- List ONLY 2 or 3 causes.\n"
            "- Prioritize causes by technical likelihood (from most to least probable).\n"
            "- Be technical, concise, and action-oriented.\n"
            "- Avoid generic or purely theoretical explanations.\n"
            "- Always think as a bench technician (diagnosis before part replacement).\n\n"
            "Response language:\n"
            "- The diagnostic response MUST be written in Brazilian Portuguese.\n\n"
            "Mandatory response format:\n\n"
            "CAUSE 1 (most likely)\n"
            "• Objective technical description (max. 2 lines)\n"
            "• Practical diagnosis: test, measurement, or direct verification\n"
            "• Initial corrective action: adjustment, repair, or replacement\n\n"
            "CAUSE 2\n"
            "• Objective technical description\n"
            "• Practical diagnosis\n"
            "• Initial corrective action\n\n"
            "CAUSE 3 (if applicable)\n"
            "• Objective technical description\n"
            "• Practical diagnosis\n"
            "• Initial corrective action\n\n"
            "Technical note (optional):\n"
            "• Only include if there is a relevant warning, common mistake, or aggravating condition.\n\n"
            "Goal:\n"
            "Deliver a fast, reliable, and resolution-focused technical diagnosis."
            # "Com base nas informações abaixo, forneça um pré-diagnóstico "
            # "técnico preliminar para um aparelho de assistência técnica.\n"
            # f"Tipo de aparelho: {tipo_aparelho}\n"
            # f"Marca/Modelo: {marca_modelo}\n"
            # f"Problema relatado: {problema_relatado}\n\n"
            # "Forneça um diagnóstico provável, possíveis causas e "
            # "recomendações iniciais. Mantenha o tom profissional e técnico."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Erro ao gerar pré-diagnóstico: {e}")
        return "Pré-diagnóstico não disponível."

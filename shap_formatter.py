def prepare_shap_for_prompt(shap_explanations):
    lines = []
    for e in shap_explanations:
        impact = "increased" if e["shap_value"] > 0 else "reduced"
        lines.append(f"• {e['feature']} {impact} the fault risk")
    return "\n".join(lines)

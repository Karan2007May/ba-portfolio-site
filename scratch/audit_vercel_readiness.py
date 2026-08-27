import os
import json
import re
from pathlib import Path

root_dir = Path(".").resolve()

print(f"Auditing workspace at: {root_dir}")

# Gather all actual files on disk with exact casing
actual_files = {}
for path in root_dir.glob("**/*"):
    if path.is_file():
        rel = str(path.relative_to(root_dir)).replace("\\", "/")
        actual_files[rel.lower()] = rel

print(f"Total files indexed: {len(actual_files)}")

missing_files = []
case_mismatches = []

# Regex for finding assets, images, html, css, js references in text files
ref_pattern = re.compile(r'["\']([a-zA-Z0-9_\-/\.]+\.(png|jpg|jpeg|svg|gif|pdf|css|js|html|json))["\']')

# Extensions to audit
target_exts = {".html", ".css", ".js", ".json"}

for path in root_dir.glob("**/*"):
    if path.is_file() and path.suffix in target_exts and not str(path).startswith(str(root_dir / "scratch")):
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            continue
        
        matches = ref_pattern.findall(content)
        rel_src = str(path.relative_to(root_dir)).replace("\\", "/")
        src_parent = Path(rel_src).parent

        for ref_full, ext in matches:
            # Ignore http/https or mailto or tel
            if ref_full.startswith(("http://", "https://", "mailto:", "tel:", "//")):
                continue
            
            # Remove leading slash or query params / fragments
            clean_ref = ref_full.split("?")[0].split("#")[0]
            if clean_ref.startswith("/"):
                clean_ref = clean_ref[1:]
            
            # Calculate target relative path
            target_path = (src_parent / clean_ref).resolve()
            try:
                target_rel = str(target_path.relative_to(root_dir)).replace("\\", "/")
            except ValueError:
                # Outside root dir
                continue

            target_lower = target_rel.lower()
            if target_lower not in actual_files:
                missing_files.append((rel_src, ref_full, target_rel))
            else:
                exact_on_disk = actual_files[target_lower]
                if exact_on_disk != target_rel:
                    case_mismatches.append((rel_src, ref_full, target_rel, exact_on_disk))

print("\n--- RESULTS ---")
print(f"Missing references ({len(missing_files)}):")
for src, ref, targ in missing_files:
    print(f"  In {src}: reference '{ref}' resolves to '{targ}' (NOT FOUND)")

print(f"\nCase mismatches ({len(case_mismatches)}):")
for src, ref, targ, exact in case_mismatches:
    print(f"  In {src}: reference '{ref}' refers to '{targ}' but disk file is '{exact}'")

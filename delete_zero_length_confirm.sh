#!/bin/bash

dir="/home/kellyb_dev/projects/second-brain"

echo "Scanning for zero-length files named 'powershell (*)' in $dir ..."

# Get distribution of files by directory
declare -A dir_counts

# Find files and count per directory
while IFS= read -r -d '' file; do
    parent_dir=$(dirname "$file")
    ((dir_counts["$parent_dir"]++))
done < <(find "$dir" -type f -name 'powershell (*)' -size 0 -print0)

# Calculate total files
total_files=0
for count in "${dir_counts[@]}"; do
    ((total_files+=count))
done

if (( total_files == 0 )); then
    echo "No zero-length 'powershell (*)' files found. Nothing to delete."
    exit 0
fi

echo
echo "Found $total_files zero-length 'powershell (*)' files distributed as follows:"
printf "%-8s %s\n" "Count" "Directory"
printf "%-8s %s\n" "-----" "---------"
for dir_path in "${!dir_counts[@]}"; do
    printf "%-8d %s\n" "${dir_counts[$dir_path]}" "$dir_path"
done | sort -nr

echo
# Ask user whether to proceed
read -p "Do you want to delete these files? (yes/no): " answer
answer=${answer,,}  # to lowercase

if [[ "$answer" != "yes" ]]; then
    echo "Deletion cancelled."
    exit 0
fi

echo
echo "Deleting files..."

count=0

# Delete files with progress
while IFS= read -r -d '' file; do
    rm -f -- "$file"
    ((count++))
    percent=$((count * 100 / total_files))
    echo -ne "Deleting files: $count/$total_files ($percent%)\r"
done < <(find "$dir" -type f -name 'powershell (*)' -size 0 -print0)

echo -e "\nDeletion complete."

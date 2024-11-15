#!/bin/bash

# Set a commit message prefix (optional)
commit_prefix="Automated commit"

# Define the number of commits you want to make
commit_count=500

# Define the folder where the files will be created
folder_name="generated_files"

# Check if the folder exists, create it if not
if [ ! -d "$folder_name" ]; then
  mkdir "$folder_name"
fi

# Loop to create, commit, and delete files
for i in $(seq 1 $commit_count)
do
  # Create a new file with a unique name in the specified folder
  echo "This is commit number $i" > "$folder_name/file_$i.txt"

  # Add the new file to git
  git add "$folder_name/file_$i.txt"

  # Commit the file with a message
  git commit -m "$commit_prefix #$i"

  # Push the commit to GitHub
  git push origin master

  # Optional: Add a small delay (helps to avoid rate-limiting)
  sleep 3
done

# After all commits are done, delete the folder and its contents
rm -r "$folder_name"

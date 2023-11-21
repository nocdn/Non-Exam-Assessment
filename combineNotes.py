import os

# Specify the folder path
folder_path = "/Users/bartek/Downloads/notesForIT"  # Replace with your folder path

# The output file
output_file = "IT Notes Unit 2.txt"

with open(output_file, "w") as outfile:
    # Get a sorted list of filenames in alphabetical order
    sorted_filenames = sorted(
        [f for f in os.listdir(folder_path) if f.endswith(".txt") and f != output_file]
    )

    # Loop through each sorted file
    for filename in sorted_filenames:
        # Construct full file path
        file_path = os.path.join(folder_path, filename)
        with open(file_path, "r") as infile:
            # Write the heading with the file name
            outfile.write(f"===== {filename} =====\n\n")

            # Read the contents and write to the output file
            outfile.write(infile.read() + "\n\n\n")

print(f"Combined text files into {output_file}")

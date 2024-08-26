import os

# Helper function to count the number of rows in a file
def count_lines_in_file(file_path):
    """Count the number of lines in a single file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return len(file.readlines())

# Check how many lines of code are in react components
def count_lines_of_code_in_react_components(directory):
    """Recursively count lines of code in all .js and .jsx files in the given directory."""
    total_lines = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                total_lines += count_lines_in_file(file_path)
    return total_lines

# Set the path to your src directory
src_directory = 'client/src'

# Count the lines of code
lines_of_code_react = count_lines_of_code_in_react_components(src_directory)
print(f"-------------------------------\nTotal lines of code in React components: {lines_of_code_react}")


# Check how many lines of code there are in the python files
def count_lines_of_code(directory):
    total_lines = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith("main.py"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    total_lines += len(lines)
                return total_lines

project_directory = './server'
lines_of_code_python = count_lines_of_code(project_directory)
print(f"Total lines of code in Python: {lines_of_code_python}")

print(f"-------------------------------\nTotal number of lines in the project: {lines_of_code_python + lines_of_code_react}\n-------------------------------")
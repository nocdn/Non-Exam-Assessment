import os


def list_files(startpath):
    with open("directory.txt", "w") as f:
        for root, dirs, files in os.walk(startpath):
            level = root.replace(startpath, "").count(os.sep)
            indent = "|-- " if level > 0 else ""
            base_indent = "|" + "    " * (level - 1) if level > 0 else ""
            f.write("{}{}/\n".format(base_indent, indent + os.path.basename(root)))
            print("{}{}/".format(base_indent, indent + os.path.basename(root)))
            subindent = "|" + "    " * level
            for file in files:
                f.write("{}|-- {}\n".format(subindent, file))
                print("{}|-- {}".format(subindent, file))


if __name__ == "__main__":
    path = input("Enter the path of the directory: ")
    if os.path.isdir(path):
        list_files(path)
        print("\nThe directory structure has also been saved to 'directory.txt'")
    else:
        print("The provided path is not a directory.")

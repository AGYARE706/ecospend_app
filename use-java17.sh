export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"
echo "Java switched to: $(java -version 2>&1 | head -1)"

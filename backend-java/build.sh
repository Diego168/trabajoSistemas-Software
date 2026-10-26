#!/bin/sh
# Compila y prueba SIN Maven (para entornos sin acceso a Maven Central).
# Requiere JDK 21 y las bibliotecas en /usr/share/java (paquetes libguava-java, liblogback-java, libapache-poi-java, etc.).
# Uso:  ./build.sh        compila y ejecuta las pruebas
#       ./build.sh run    compila y arranca el servidor
set -e
cd "$(dirname "$0")"
L=/usr/share/java
CP="$L/guava.jar:$L/error_prone_annotations.jar:$L/jsr305.jar:$L/logback-classic.jar:$L/logback-core.jar:$L/slf4j-api.jar:$L/poi.jar:$L/poi-ooxml.jar:$L/poi-ooxml-schemas.jar:$L/xmlbeans.jar:$L/commons-collections4.jar:$L/commons-compress.jar:$L/commons-codec.jar:$L/curvesapi.jar:$L/commons-lang3.jar:$L/commons-csv.jar:$L/commons-io.jar:$L/jackson-databind.jar:$L/jackson-core.jar:$L/jackson-annotations.jar:$L/h2.jar"
rm -rf target/classes target/test-classes && mkdir -p target/classes target/test-classes
javac -encoding UTF-8 --release 21 -cp "$CP" -d target/classes $(find src/main/java -name '*.java')
cp -r src/main/resources/* target/classes/
if [ "$1" = "run" ]; then exec java -cp "target/classes:$CP" com.artesanialegado.App; fi
JUNIT=$L/junit-platform-console-standalone.jar
javac -encoding UTF-8 --release 21 -cp "target/classes:$CP:$JUNIT" -d target/test-classes $(find src/test/java -name '*.java')
cp -r src/test/resources/* target/test-classes/ 2>/dev/null || true
java -jar $JUNIT -cp "target/classes:target/test-classes:$CP" --scan-classpath target/test-classes --details=tree --disable-banner

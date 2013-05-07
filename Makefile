
# Uncomment one of the following pairs.

#JAVAROOT=/usr/java/jdk1.5.0
#JAVAC=${JAVAROOT}/bin/javac

#JAVAROOT=/usr/java/j2sdk1.4.2
#JAVAC=${JAVAROOT}/bin/javac

#JAVAROOT=/usr/java/j2sdk1.4.2
#JAVAC=jikes +P -source 1.4 -classpath ${JAVAROOT}/jre/lib/rt.jar
        # ARGH, doesn't work any more, conflicts with -classpath now used in individual rule

#JAVAROOT=/opt/blackdown-jdk-1.4.2.03
#JAVAC=${JAVAROOT}/bin/javac

# doesn't work for this project--- JFrame.EXIT_ON_CLOSE not defined
#JAVAC=javac1.2
#JAVAROOT=c:/jdk1.2.2

JAVAC=javac1.3
JAVAROOT=c:/jdk1.3.1_20

#JAVAC=javac1.6
#JAVAROOT="c:/Program Files (x86)/Java/jdk1.6.0_17"

#JAVAC=javac1.7
#JAVAROOT="c:/Program Files/Java/jdk1.7.0_21"


uname := $(shell uname -o)
#dummy := $(warning uname = $(uname))
ifeq ($(uname),Cygwin)
    # on cygwin, apparently it's this
    CLASSPATHSEP = ;
else
    # on linux, it's this
    CLASSPATHSEP = :
endif



JARFILE = SpiralApplet.jar
CLASSES = \
        MyGraphics.class \
        MyGraphics3D.class \
        GraphicsAntiAliasingSetter.class \
        TimingGraph.class \
        Rational.class \
        SpiralApplet.class
        ${NULL}
JAR_DEPENDS_ON = ${CLASSES}      macros.h Makefile javacpp javarenumber README
JAR_CONTAINS = *.class *.prejava macros.h Makefile javacpp javarenumber README

# If we want to be able to run it as java -jar SpiralApplet.jar, then need to do this:
JAR_CONTAINS += com

.PHONY: all default jar
default: Makefile ${JAR_DEPENDS_ON}
jar: ${JARFILE}
all: jar

${JARFILE}: Makefile META-INF/MANIFEST.MF ${JAR_DEPENDS_ON}
        # XXX argh, exits with status 0 even if missing something
	${JAVAROOT}/bin/jar -cfm ${JARFILE} META-INF/MANIFEST.MF ${JAR_CONTAINS}

CPPFLAGS += -Wall -Werror
# The following seems to work but clutters up output and may be less portable
#CPPFLAGS += -pedantic -std=c99
# The following is too strict for me (requires #'s to be non-indented)
#CPPFLAGS += -Wtraditional

.SUFFIXES: .prejava .java .class
.prejava.class:
	javacpp ${CPPFLAGS} ${JAVAC} -deprecation -classpath ".$(CLASSPATHSEP)./donhatchsw.jar" $*.prejava
ifneq ($(uname),Cygwin)
	javarenumber -v 0 $*.class
        # too slow... only do this in the production version
        # on second thought, try it, for now...
        # on third hand, it bombs with Couldn't open GraphicsAntiAliasingSetter$*.class because that one has no subclasses... argh.
        #@javarenumber -v -1 $*'$$'*.class
endif

# Separate renumber target since renumbering all the subclass files
# on every recompile is slow :-(.  Usually I run "make renumber"
# after an exception, and then run the program again so I will get
# a stack trace with line numbers from the .prejava files instead of
# the .java files.

${JARFILE}.is_renumbered: $(JAR_DEPENDS_ON)
	javarenumber -v -1 *.class
	${JAVAROOT}/bin/jar -cfm $(JARFILE).is_renumbered META-INF/MANIFEST.MF ${JAR_CONTAINS}
	touch $@
.PHONY: renumber
renumber: $(JARFILE).is_renumbered


MyGraphics.class: macros.h Makefile donhatchsw.jar
MyGraphics3D.class: macros.h Makefile donhatchsw.jar
GraphicsAntiAliasingSetter.class: macros.h Makefile donhatchsw.jar
TimingGraph.class: macros.h Makefile
Rational.class: macros.h Makefile
SpiralApplet.class: macros.h Makefile donhatchsw.jar

SENDFILES = index.php $(JARFILE)
.PHONY: send
send: renumber
	sh -c "scp $(SENDFILES) hatch@plunk.org:public_html/SpiralApplet/."

.PHONY: clean
clean:
	rm -f core ${JARFILE} *.class *.java.lines *.java

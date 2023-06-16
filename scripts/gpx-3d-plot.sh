#!/bin/bash
#
# @author Dani Huertas
# @email huertas.dani@gmail.com
# @date Thu Aug 14 17:30:10 CEST 2014
#

# TODO optional conversion from lon,lat,alt to x,y,z coordinates

if [ $# -lt 1 ]
then 
  echo "Usage $0 path/to/file.gpx [line-offset]"
  exit 0
fi

if [ ! -f $1 ]; then
  echo "File $1 not found!"
  exit 0
fi

DATA_OUT=$(echo $1 | sed 's/gpx/dat/g')
PLOT_OUT=$(echo $1 | sed 's/gpx/plot/g');

### GPX parser using python
py=`cat <<EOF
import xml.etree.ElementTree as ET

tree = ET.parse('${1}')

root = tree.getroot()

for trk in root.findall('{*}trk'):
    for trkseg in trk.findall('{*}trkseg'):
        for trkpt in trkseg.findall('{*}trkpt'):
            time, ele = '1970-01-01T00:00:00Z', '0'
            for child in trkpt:
                if child.tag.endswith('time'):
                    time = child.text
                elif child.tag.endswith('ele'):
                    ele = child.text
            if ele != '0':
                print(ele, time, trkpt.attrib['lat'], trkpt.attrib['lon'], sep='\t')
EOF`

### create gnuplot file
plot=`cat <<EOF
set terminal wxt
set ticslevel 0
set zrange [0:*]
set xlabel 'latitude'
set ylabel 'longitude'
set zlabel 'altitude'
unset key
splot '$DATA_OUT' using 3:4:1 w impulses lw 2 lc palette, \\
'' using 3:4:1 lc rgb 'black' lt 2 lw 0.5 w l
EOF`

echo "$plot" > $PLOT_OUT

### parse gpx
python3 -c "$py" > $DATA_OUT

### plot data
gnuplot $PLOT_OUT -persist

### clean up
#rm $DATA_OUT
#rm $PLOT_OUT

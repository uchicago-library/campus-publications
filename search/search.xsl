<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
	<div class='docHits'>
		<xsl:apply-templates/>
	</div>
</xsl:template>

<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:template match="docHit">
<div class="row docHit"><xsl:apply-templates/></div>
</xsl:template>

<xsl:template match="meta">
	<xsl:variable name="id" select="sort-identifier"/>
    <!-- 'http://xtf.lib.uchicago.edu:8180/campub/data/bookreader/', -->
	<xsl:variable name="src" select="
		concat(
            'https://campub.lib.uchicago.edu/campub/data/bookreader/',
			$id,
			'/',
			$id,
			'.jpg'
		)
	"/>
	<xsl:variable name="url">
		<xsl:choose>
			<xsl:when test="/crossQueryResult/parameters/param[@name='keyword']">
				<xsl:value-of select="
					concat(
						'/view/?docId=',
						$id,
						';query=',
						//param[@name='keyword']/@value
					)
				"/>
			</xsl:when>
			<xsl:when test="/crossQueryResult/parameters/param[@name='text']">
				<xsl:value-of select="
					concat(
						'/view/?docId=',
						$id,
						';query=',
						//param[@name='text']/@value
					)
				"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="
					concat(
						'/view/?docId=',
						$id
					)
				"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="year">
		<xsl:choose>
			<xsl:when test="contains(range-date, '-')">
				<xsl:value-of select="substring-before(range-date, '-')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="range-date"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="monthnumber">
		<xsl:value-of select="substring-before(substring-after(range-date, '-'), '-')"/>
	</xsl:variable>
	<xsl:variable name="month">
		<xsl:if test="$monthnumber = '01'">January</xsl:if>
		<xsl:if test="$monthnumber = '02'">February</xsl:if>
		<xsl:if test="$monthnumber = '03'">March</xsl:if>
		<xsl:if test="$monthnumber = '04'">April</xsl:if>
		<xsl:if test="$monthnumber = '05'">May</xsl:if>
		<xsl:if test="$monthnumber = '06'">June</xsl:if>
		<xsl:if test="$monthnumber = '07'">July</xsl:if>
		<xsl:if test="$monthnumber = '08'">August</xsl:if>
		<xsl:if test="$monthnumber = '09'">September</xsl:if>
		<xsl:if test="$monthnumber = '10'">October</xsl:if>
		<xsl:if test="$monthnumber = '11'">November</xsl:if>
		<xsl:if test="$monthnumber = '12'">December</xsl:if>
	</xsl:variable>
	<xsl:variable name="day">
		<xsl:value-of select="number(substring-after(substring-after(range-date, '-'), '-'))"/>
	</xsl:variable>
<!--
	<xsl:variable name="date">
		<xsl:choose>
			<xsl:when test="contains(range-date, '-')">
				<xsl:value-of select="concat($month, ' ', $day, ', ', $year)"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$year"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
-->
	<xsl:variable name="date">
        <xsl:value-of select="human-readable-date"/>
    </xsl:variable>
    <xsl:variable name="number0">
        <xsl:value-of select="
                substring-after(substring-after(substring-after(sort-identifier, '-'), '-'), '-')
        "/>
    </xsl:variable>
    <xsl:variable name="number">
        <xsl:value-of select="number(translate($number0, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ''))"/>
    </xsl:variable>
	<xsl:variable name="title">
        <xsl:choose>
            <xsl:when test="substring-before(substring-after(sort-identifier, '-'), '-') = '0004'">
		        <xsl:value-of select="
	        		concat(
		        		substring-before(facet-sidebartitle, '::'),
		    		    ', ',
		    		    $date)
                "/>
            </xsl:when>
            <xsl:when test="substring-before(substring-after(sort-identifier, '-'), '-') = '0447' and string-length(sort-identifier) = 19">
		        <xsl:value-of select="
	        		concat(
		        		substring-before(facet-sidebartitle, '::'),
		    		    ', ',
		    		    $date)
                "/>
            </xsl:when>
            <xsl:when test="substring-before(substring-after(sort-identifier, '-'), '-') = '0447' and string-length(sort-identifier) = 22">
		        <xsl:value-of select="
	        		concat(
		        		substring-before(facet-sidebartitle, '::'),
		    		    ', ',
		    		    $date,
                                    ', Session ',
                                    substring(sort-identifier, 22, 1))
                "/>
            </xsl:when>
            <xsl:when test="$number = 0">
		        <xsl:value-of select="
	        		concat(
		        		substring-before(facet-sidebartitle, '::'),
               				', Vol. ',
		    		number(substring-after(facet-sidebartitle, '::Volume ')),
		    		', ',
		    		$date)
                "/>
            </xsl:when>
            <xsl:otherwise>
		        <xsl:value-of select="
	        		concat(
		        		substring-before(facet-sidebartitle, '::'),
               				', Vol. ',
		    		number(substring-after(facet-sidebartitle, '::Volume ')),
		    		', No. ',
                    $number,
                    ', ',
		    		$date)
                "/>
            </xsl:otherwise>
        </xsl:choose>
	</xsl:variable>
	<xsl:variable name="matches">
		<xsl:value-of select="parent::docHit/@totalHits"/>
		<xsl:choose>
			<xsl:when test="parent::docHit/@totalHits &gt; 1"> matches</xsl:when>
			<xsl:otherwise> match</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<div class='span1 thumbnaildiv'>
		<a href='{$url}'>
			<img alt='{$title}' src='{$src}'/>
		</a>
	</div>

	<div class='span8'>
		<p>
		<a href='{$url}'><xsl:value-of select="$title"/></a><br/>
		<xsl:if test="count(../snippet) &gt; 0">
			<strong><xsl:value-of select="$matches"/></strong><br/>
		</xsl:if>
		<xsl:for-each select="../snippet[position() &lt; 4]">
			<xsl:apply-templates select="." mode="dl"/>
		</xsl:for-each>
		</p>
	</div>
</xsl:template>

<xsl:template match="snippet"/>

<xsl:template match="snippet" mode="dl">
<xsl:apply-templates/><br/>
</xsl:template>

<xsl:template match="hit">
<xsl:variable name="id" select="ancestor::docHit/meta/sort-identifier"/>
<xsl:variable name="query">
	<xsl:choose>
		<xsl:when test="//param[@name='keyword']">
			<xsl:value-of select="
				concat(
					';query=',
					//param[@name='keyword']/@value
				)
			"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="
				concat(
					';query=',
					//param[@name='text']/@value
				)
			"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:variable>
<xsl:variable name="queryexclude">
	<xsl:choose>
		<xsl:when test="//param[@name='text-exclude']">
			<xsl:value-of select="
				concat(
					';query-exclude=',
					//param[@name='text-exclude']/@value
				)
			"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="''"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:variable>
<xsl:variable name="queryjoin">
	<xsl:choose>
		<xsl:when test="//param[@name='text-join']">
			<xsl:value-of select="
				concat(
					';query-join=',
					//param[@name='text-join']/@value
				)
			"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="''"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:variable>
<xsl:variable name="queryprox">
	<xsl:choose>
		<xsl:when test="//param[@name='text-join']">
			<xsl:value-of select="
				concat(
					';query-prox=',
					//param[@name='text-prox']/@value
				)
			"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="''"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:variable>
<xsl:variable name="url">
	<xsl:value-of select="
		concat(
			'/view/?docId=',
			$id,
			$query,
			$queryexclude,
			$queryjoin,
			$queryprox,
			'#page/',
			number(ancestor::snippet/@sectionType)
		)
	"/>
</xsl:variable>
<strong><a href="{$url}"><xsl:apply-templates/></a></strong>
</xsl:template>

</xsl:stylesheet>

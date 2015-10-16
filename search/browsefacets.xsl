<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="docHit"/>
<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:template match="/">
<h2>search within:</h2>
<p><strong><xsl:value-of select="/crossQueryResult/parameters/param[@name='f1-title']/@value"/></strong></p>
<form>
<input class="span3" name="keyword" type="text"/>
<input name="f1-title" type="hidden" value="{
	substring-after(
		/crossQueryResult/parameters/param[@name='f1-category']/@value,
		'university::'
	)
}"/>
<xsl:if test="/crossQueryResult/parameters/param[@name='f1-date']">
	<input name="f1-date" type="hidden" value="{/crossQueryResult/parameters/param[@name='f1-date']/@value}"/>
</xsl:if>
</form>
<xsl:apply-templates select="/crossQueryResult/facet[@field='facet-date']"/>
</xsl:template>

<xsl:template match="facet[@field='facet-date']">
<h2>Dates</h2>
<ul><xsl:apply-templates/></ul>
</xsl:template>

<xsl:template match="facet[@field='facet-date']/group">
<xsl:variable name="name">
	<xsl:value-of select="
		concat(
			'f1-',
			substring-after(parent::facet/@field, '-')
		)
	"/>
</xsl:variable>
<xsl:variable name="value">
<xsl:choose>
	<xsl:when test="parent::group/parent::group/parent::group/parent::facet">
		<xsl:value-of select="number(@value)"/>
	</xsl:when>
	<xsl:when test="parent::group/parent::group/parent::facet">
		<xsl:if test="@value = '01'">January</xsl:if>
		<xsl:if test="@value = '02'">February</xsl:if>
		<xsl:if test="@value = '03'">March</xsl:if>
		<xsl:if test="@value = '04'">April</xsl:if>
		<xsl:if test="@value = '05'">May</xsl:if>
		<xsl:if test="@value = '06'">June</xsl:if>
		<xsl:if test="@value = '07'">July</xsl:if>
		<xsl:if test="@value = '08'">August</xsl:if>
		<xsl:if test="@value = '09'">September</xsl:if>
		<xsl:if test="@value = '10'">October</xsl:if>
		<xsl:if test="@value = '11'">November</xsl:if>
		<xsl:if test="@value = '12'">December</xsl:if>
	</xsl:when>
	<xsl:otherwise>
		<xsl:value-of select="@value"/>
	</xsl:otherwise>
</xsl:choose>
</xsl:variable>
<xsl:variable name="url">
	<xsl:value-of select="
		concat(
			'/search?',
			'keyword=',
			/crossQueryResult/parameters/param[@name='keyword']/@value,
			'&amp;',
			$name,
			'=',
			@value
		)
	"/>
	<xsl:if test="/crossQueryResult/parameters/param[@name='f1-date']">
		<xsl:value-of select="
			concat(
				'&amp;f1-date=',
				/crossQueryResult/parameters/param[@name='f1-date']/@value
			)
		"/>
	</xsl:if>
	<xsl:if test="/crossQueryResult/parameters/param[@name='f1-title']">
		<xsl:value-of select="
			concat(
				'&amp;f1-title=',
				/crossQueryResult/parameters/param[@name='f1-title']/@value
			)
		"/>
	</xsl:if>
</xsl:variable>
<xsl:choose>
	<xsl:when test="/crossQueryResult/parameters/param[@name=$name]">
		<li>
			<a class="backurl" href="{$url}">&lt; any <xsl:value-of select="substring-after(parent::facet/@field, 'facet-')"/></a>
		</li>
		<li>
			<strong>
				<xsl:value-of select="$value"/>
			</strong>
		</li>
	</xsl:when>
	<xsl:otherwise>
		<li>
			<a href="{$url}">
				<xsl:value-of select="$value"/>
			</a>
		</li>
	</xsl:otherwise>
</xsl:choose>
</xsl:template>

</xsl:stylesheet>

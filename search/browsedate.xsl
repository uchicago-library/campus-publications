<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="*">
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="docHit"/>
<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:template match="facet[@field='facet-date']">
	<ul class="expandable"><xsl:apply-templates/></ul>
</xsl:template>

<xsl:template match="facet[@field='facet-date']/group">
<xsl:variable name="value">
<xsl:value-of select="
	//docHit/meta[
		facet-date = concat(
			current()/parent::group/@value,
			'::',
			current()/@value)
	]/year
"/>
</xsl:variable>
<li>
	<a href="/search/?f1-date={@value}">
		<xsl:value-of select="@value"/>
		<xsl:text> </xsl:text>
		<span class="facetcount">(<xsl:value-of select="@totalDocs"/>)</span>
	</a>
</li>
</xsl:template>

</xsl:stylesheet>

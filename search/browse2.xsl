<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<ul><xsl:apply-templates/></ul>
</xsl:template>

<xsl:template match="*">
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="facet"/>
<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:template match="docHit">
<li>
	<a href="/view/?docId={meta/sort-identifier}">
		<xsl:value-of select="meta/display-item"/>
	</a>
</li>
</xsl:template>

</xsl:stylesheet>

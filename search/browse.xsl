<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:param name="category"/>

<xsl:template match="*">
<xsl:apply-templates/>
</xsl:template>

<xsl:template match="docHit"/>
<xsl:template match="parameters"/>
<xsl:template match="query"/>

<xsl:template match="facet[@field='facet-category']/group">
	<xsl:if test="@value=$category">
		<ul class="expandable"><xsl:apply-templates/></ul>
	</xsl:if>
</xsl:template>

<xsl:template match="facet[@field='facet-category']/group/group">
<xsl:variable name="value">
<xsl:value-of select="
	//docHit/meta[
		facet-category = concat(
			$category,
			'::',
			current()/@value)
	]/display-title
"/>
</xsl:variable>
<li><a href="/search/?f1-title={@value}"><xsl:value-of select="$value"/></a></li>
</xsl:template>

</xsl:stylesheet>

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
    substring-after(
	    //docHit/meta[
		    facet-category = concat(
			    $category,
			    '::',
			    current()/@value)
	    ]/facet-category,
        '::'
    )
"/>
</xsl:variable>
<li>
    <a href="/search/?f1-title={@value}">
        <xsl:value-of select="$value"/>
        <xsl:choose>
            <xsl:when test="$value='Cap and Gown'"> (1895-1969)</xsl:when>
            <xsl:when test="$value='Daily Maroon'"> (1902-1987)</xsl:when>
            <xsl:when test="$value='Medicine on the Midway'"> (1944-1981)</xsl:when>
            <xsl:when test="$value='Quarterly Calendar'"> (1892-1896)</xsl:when>
            <xsl:when test="$value='University Record'"> (1896-1908)</xsl:when>
            <xsl:when test="$value='University Record (New Series)'"> (1915-1933)</xsl:when>
            <xsl:when test="$value='University of Chicago Magazine'"> (1908-1995)</xsl:when>
            <xsl:when test="$value='University of Chicago Record'"> (1967-1981)</xsl:when>
            <xsl:when test="$value='University of Chicago Weekly'"> (1892-1899)</xsl:when>
        </xsl:choose>
    </a>
</li>
</xsl:template>

</xsl:stylesheet>
